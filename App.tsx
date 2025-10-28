import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { GlobalContextProviders } from "./components/_globalContextProviders";
import Page_0 from "./pages/admin.tsx";
import PageLayout_0 from "./pages/admin.pageLayout.tsx";
import Page_1 from "./pages/login.tsx";
import PageLayout_1 from "./pages/login.pageLayout.tsx";
import Page_2 from "./pages/_index.tsx";
import PageLayout_2 from "./pages/_index.pageLayout.tsx";
import Page_3 from "./pages/ledger.tsx";
import PageLayout_3 from "./pages/ledger.pageLayout.tsx";
import Page_4 from "./pages/profile.tsx";
import PageLayout_4 from "./pages/profile.pageLayout.tsx";
import Page_5 from "./pages/reports.tsx";
import PageLayout_5 from "./pages/reports.pageLayout.tsx";
import Page_6 from "./pages/inventory.tsx";
import PageLayout_6 from "./pages/inventory.pageLayout.tsx";
import Page_7 from "./pages/suppliers.tsx";
import PageLayout_7 from "./pages/suppliers.pageLayout.tsx";
import Page_8 from "./pages/marketplace.tsx";
import PageLayout_8 from "./pages/marketplace.pageLayout.tsx";

if (!window.requestIdleCallback) {
  window.requestIdleCallback = (cb) => {
    setTimeout(cb, 1);
  };
}

import "./base.css";

const fileNameToRoute = new Map([["./pages/admin.tsx","/admin"],["./pages/login.tsx","/login"],["./pages/_index.tsx","/"],["./pages/ledger.tsx","/ledger"],["./pages/profile.tsx","/profile"],["./pages/reports.tsx","/reports"],["./pages/inventory.tsx","/inventory"],["./pages/suppliers.tsx","/suppliers"],["./pages/marketplace.tsx","/marketplace"]]);
const fileNameToComponent = new Map([
    ["./pages/admin.tsx", Page_0],
["./pages/login.tsx", Page_1],
["./pages/_index.tsx", Page_2],
["./pages/ledger.tsx", Page_3],
["./pages/profile.tsx", Page_4],
["./pages/reports.tsx", Page_5],
["./pages/inventory.tsx", Page_6],
["./pages/suppliers.tsx", Page_7],
["./pages/marketplace.tsx", Page_8],
  ]);

function makePageRoute(filename: string) {
  const Component = fileNameToComponent.get(filename);
  return <Component />;
}

function toElement({
  trie,
  fileNameToRoute,
  makePageRoute,
}: {
  trie: LayoutTrie;
  fileNameToRoute: Map<string, string>;
  makePageRoute: (filename: string) => React.ReactNode;
}) {
  return [
    ...trie.topLevel.map((filename) => (
      <Route
        key={fileNameToRoute.get(filename)}
        path={fileNameToRoute.get(filename)}
        element={makePageRoute(filename)}
      />
    )),
    ...Array.from(trie.trie.entries()).map(([Component, child], index) => (
      <Route
        key={index}
        element={
          <Component>
            <Outlet />
          </Component>
        }
      >
        {toElement({ trie: child, fileNameToRoute, makePageRoute })}
      </Route>
    )),
  ];
}

type LayoutTrieNode = Map<
  React.ComponentType<{ children: React.ReactNode }>,
  LayoutTrie
>;
type LayoutTrie = { topLevel: string[]; trie: LayoutTrieNode };
function buildLayoutTrie(layouts: {
  [fileName: string]: React.ComponentType<{ children: React.ReactNode }>[];
}): LayoutTrie {
  const result: LayoutTrie = { topLevel: [], trie: new Map() };
  Object.entries(layouts).forEach(([fileName, components]) => {
    let cur: LayoutTrie = result;
    for (const component of components) {
      if (!cur.trie.has(component)) {
        cur.trie.set(component, {
          topLevel: [],
          trie: new Map(),
        });
      }
      cur = cur.trie.get(component)!;
    }
    cur.topLevel.push(fileName);
  });
  return result;
}

function NotFound() {
  return (
    <div>
      <h1>Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>Go back to the <a href="/" style={{ color: 'blue' }}>home page</a>.</p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <GlobalContextProviders>
        <Routes>
          {toElement({ trie: buildLayoutTrie({
"./pages/admin.tsx": PageLayout_0,
"./pages/login.tsx": PageLayout_1,
"./pages/_index.tsx": PageLayout_2,
"./pages/ledger.tsx": PageLayout_3,
"./pages/profile.tsx": PageLayout_4,
"./pages/reports.tsx": PageLayout_5,
"./pages/inventory.tsx": PageLayout_6,
"./pages/suppliers.tsx": PageLayout_7,
"./pages/marketplace.tsx": PageLayout_8,
}), fileNameToRoute, makePageRoute })} 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </GlobalContextProviders>
    </BrowserRouter>
  );
}
