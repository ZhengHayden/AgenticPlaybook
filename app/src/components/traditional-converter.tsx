"use client";

import { useEffect } from "react";

/**
 * Converts on-screen Simplified Chinese to Traditional at display time.
 *
 * Traditional Chinese reuses the Simplified content dictionary (see
 * `SelectedLocale` in i18n.ts) — rather than maintaining a third dictionary, we
 * convert characters in the live DOM with opencc-js (`cn` → `tw`). A
 * MutationObserver keeps newly rendered/changed nodes converted. When `active`
 * is false the component is inert; the locale provider key-remounts the content
 * subtree on locale change, so leaving Traditional restores Simplified cleanly.
 */
interface TraditionalConverterProps {
  active: boolean;
}

/** Elements whose text must never be transformed. */
const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "TEXTAREA",
  "INPUT",
  "CODE",
  "PRE",
  "NOSCRIPT",
]);

/** Attributes that hold user-visible text worth converting. */
const TEXT_ATTRS = ["placeholder", "title", "aria-label"] as const;

const NO_CONVERT_ATTR = "data-no-convert";

function shouldSkip(node: Node): boolean {
  let el: Node | null = node;
  while (el) {
    if (el.nodeType === Node.ELEMENT_NODE) {
      const element = el as Element;
      if (SKIP_TAGS.has(element.tagName)) return true;
      if (element.hasAttribute(NO_CONVERT_ATTR)) return true;
    }
    el = el.parentNode;
  }
  return false;
}

export function TraditionalConverter({ active }: TraditionalConverterProps) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    let cancelled = false;
    let observer: MutationObserver | undefined;

    const start = async () => {
      const OpenCC = await import("opencc-js");
      if (cancelled) return;
      const convert = OpenCC.Converter({ from: "cn", to: "tw" });

      const convertTextNode = (node: Text) => {
        const original = node.nodeValue;
        if (!original || !original.trim() || shouldSkip(node)) return;
        const next = convert(original);
        if (next !== original) node.nodeValue = next;
      };

      const convertAttributes = (el: Element) => {
        if (shouldSkip(el)) return;
        for (const attr of TEXT_ATTRS) {
          const value = el.getAttribute(attr);
          if (!value || !value.trim()) continue;
          const next = convert(value);
          if (next !== value) el.setAttribute(attr, next);
        }
      };

      const walk = (root: Node) => {
        if (root.nodeType === Node.TEXT_NODE) {
          convertTextNode(root as Text);
          return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE) return;
        convertAttributes(root as Element);
        const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const texts: Text[] = [];
        while (treeWalker.nextNode()) texts.push(treeWalker.currentNode as Text);
        texts.forEach(convertTextNode);
        root.childNodes.forEach((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) convertAttributes(child as Element);
        });
        (root as Element)
          .querySelectorAll(TEXT_ATTRS.map((a) => `[${a}]`).join(","))
          .forEach((el) => convertAttributes(el));
      };

      // Convert the existing DOM once, then watch for changes. We disconnect
      // while writing so our own mutations don't re-trigger the observer.
      const run = (mutations: MutationRecord[]) => {
        observer?.disconnect();
        for (const m of mutations) {
          if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) {
            convertTextNode(m.target as Text);
          } else if (m.type === "attributes" && m.target.nodeType === Node.ELEMENT_NODE) {
            convertAttributes(m.target as Element);
          } else {
            m.addedNodes.forEach(walk);
          }
        }
        reconnect();
      };

      const reconnect = () => {
        observer?.observe(document.body, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: [...TEXT_ATTRS],
        });
      };

      walk(document.body);
      observer = new MutationObserver(run);
      reconnect();
    };

    void start();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [active]);

  return null;
}
