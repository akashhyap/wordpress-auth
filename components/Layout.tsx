import Head from "next/head";
import React, { ReactNode } from "react";

import Header from "./Header";

type LayoutProps = {
  children: ReactNode;
  siteLogo?: string;
};

export default function Layout({ children, siteLogo }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Headless WP App</title>
      </Head>
      <Header siteLogo={siteLogo}/>
      <main>{children}</main>
    </>
  );
}
