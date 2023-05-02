import Link from "next/link";
import { useEffect } from 'react';

import useAuth from "../hooks/useAuth";
import { useCart } from "./cart/CartContext";
import Image from "next/image";

type logo = {
  siteLogo?: string;
};

export default function Nav({ siteLogo }: logo) {
  const { loggedIn } = useAuth();
  const { cartCount, updateCartData } = useCart();

  useEffect(() => {
    updateCartData();
  }, [loggedIn, updateCartData]);

  return (
    <nav className="relative max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8"
      aria-label="Global">
      <div className="flex items-center justify-between w-full">
        <div className="relative basis-40">
          <Link href="/" legacyBehavior>
            <a>
              {siteLogo ? (
                <Image
                  src={siteLogo}
                  alt="logo"
                  layout="responsive"
                  width={300}
                  height={139}
                />
              ) : (
                // Replace with a default image or a placeholder
                <div className="bg-gray-200" style={{ width: 300, height: 139 }}>
                  SalviaExtract
                </div>
              )}
            </a>
          </Link>
        </div>
      </div>
      <div
        id="navbar-collapse-with-animation"
        className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block"
      >
        <div id="navbar-collapse-with-animation" className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block">
        <div className="flex flex-col gap-y-4 gap-x-0 mt-5 sm:flex-row sm:items-center sm:justify-end sm:gap-y-0 sm:gap-x-7 sm:mt-0 sm:pl-7 [&>a]:text-black">
          <Link href="/">
            <a>Home</a>
          </Link>

          {!loggedIn ? (
            <>

              <Link href="/log-in">
                <a>Log In</a>
              </Link>


              <Link href="/sign-up">
                <a>Sign Up</a>
              </Link>

            </>
          ) : (
            <>

              <Link href="/members">
                <a>Members</a>
              </Link>

              <Link href="/create-post">
                <a>Create Post</a>
              </Link>

              <Link href="/profile">
                <a>Profile</a>
              </Link>

              <Link href="/log-out">
                <a>Log Out</a>
              </Link>

            </>
          )}

          <Link href="/cart" legacyBehavior passHref>
            <a>
              Cart <span>{cartCount}</span>
            </a>
          </Link>
          </div>
        </div>
      </div>

    </nav>
  );
}
