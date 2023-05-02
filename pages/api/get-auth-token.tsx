import type { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = Cookies.parse(req.headers.cookie ?? '');
    const loggedInCookieName = `wordpress_logged_in_${process.env.NEXT_PUBLIC_COOKIE_HASH}`;
    const loggedInCookieValue = cookies[loggedInCookieName];

    if (loggedInCookieValue) {
      res.status(200).json({ authToken: loggedInCookieValue });
    } else {
      res.status(404).json({ message: 'Auth token not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}
