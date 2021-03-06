import { getPage } from '../../index';
import { render, screen } from '@testing-library/react';
import path from 'path';
import userEvent from '@testing-library/user-event';

describe('ssr-redirect', () => {
  describe.each([['getServerSideProps', 'ssr']])(
    'Page with %s',
    (_dataFetchingType, directory) => {
      it('Correctly handles single redirect', async () => {
        const { page } = await getPage({
          nextRoot: path.join(__dirname, '__fixtures__', directory),
          route: '/proxy-to-page-a',
        });

        render(page);
        expect(screen.getByText('Page A')).toBeInTheDocument();
      });
    }
  );

  describe.each([['getServerSideProps', 'ssr']])(
    'Page with %s',
    (_dataFetchingType, directory) => {
      it('Correctly handles multiple redirects', async () => {
        const { page } = await getPage({
          nextRoot: path.join(__dirname, '__fixtures__', directory),
          route: '/proxy-page?destination=/proxy-to-page-a',
        });

        render(page);
        expect(screen.getByText('Page A')).toBeInTheDocument();
      });
    }
  );

  describe.each([['getServerSideProps', 'ssr']])(
    'Page with %s',
    (_dataFetchingType, directory) => {
      it('Correctly handles multiple redirects after client side navigation', async () => {
        const { page } = await getPage({
          nextRoot: path.join(__dirname, '__fixtures__', directory),
          route: '/page-b',
        });

        render(page);
        expect(screen.getByText('Page B')).toBeInTheDocument();
        userEvent.click(screen.getByText('Proxy link'));

        await screen.findByText('Page A');
        expect(
          screen.getByText('req.headers.referer: "http://localhost/page-b"')
        ).toBeInTheDocument();
      });
    }
  );
});
