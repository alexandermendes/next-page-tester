import { existsSync } from 'fs';
import React, { ReactNode } from 'react';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import type { NextRouter } from 'next/router';
import { parseRoute, removeFileExtension, parseQueryString } from './utils';
import type { Options, PageObject, PageData } from './commonTypes';

// https://github.com/vercel/next.js/issues/7479#issuecomment-659859682
function makeDefaultRouterMock(props?: Partial<NextRouter>): NextRouter {
  const routerMock = {
    basePath: '',
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    push: /* istanbul ignore next */ async () => true,
    replace: /* istanbul ignore next */ async () => true,
    reload: () => {},
    back: () => {},
    prefetch: async () => {},
    beforePopState: () => {},
    events: {
      on: () => {},
      off: () => {},
      emit: () => {},
    },
    isFallback: false,
  };

  return { ...routerMock, ...props };
}

export default function preparePage({
  pagesDirectory,
  pageData,
  pageObject: { page, pagePath, params, route },
  routerMocker,
  customApp,
}: {
  pagesDirectory: string;
  pageData: PageData;
  pageObject: PageObject;
  routerMocker: Exclude<Options['router'], undefined>;
  customApp: boolean;
}): ReactNode {
  // Render page element
  const props = pageData?.props;
  let pageElement = React.createElement(page.default, props);

  // Optionally wrap with custom App
  const customAppPath = pagesDirectory + '/_app.js';
  if (customApp && existsSync(customAppPath)) {
    const customAppComponent = require(customAppPath).default;
    pageElement = React.createElement(customAppComponent, {
      Component: page.default,
      pageProps: props,
    });
  }

  // Wrap with RouterContext provider
  const { pathname, search, hash } = parseRoute({ route });
  return React.createElement(
    RouterContext.Provider,
    {
      value: routerMocker(
        makeDefaultRouterMock({
          asPath: pathname + search + hash, // Includes querystring and anchor
          pathname: removeFileExtension({ path: pagePath }), // Page component path without extension
          query: { ...params, ...parseQueryString({ queryString: search }) }, // Route params + parsed querystring
          route: removeFileExtension({ path: pagePath }), // Page component path without extension
        })
      ),
    },
    pageElement
  );
}
