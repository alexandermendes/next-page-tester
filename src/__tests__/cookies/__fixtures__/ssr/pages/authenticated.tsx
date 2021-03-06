import React from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';

type Props = {
  reqHeadersCookie?: string;
};

export default function Authenticated({ reqHeadersCookie }: Props) {
  return (
    <div>
      <span>Authenticated content</span>
      <Link href="/login">
        <a>To login</a>
      </Link>
      <div>req.headers.cookies: "{reqHeadersCookie}"</div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
}) => {
  return { props: { reqHeadersCookie: req.headers.cookie } };
};
