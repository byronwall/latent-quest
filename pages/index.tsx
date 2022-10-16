import { Container } from '@mantine/core';
import Link from 'next/link';

import { ImageList } from '../components/ImageList';

export function Index() {
  return (
    <>
      <Link href="/create">
        <a>create new image</a>
      </Link>
      <ImageList />
    </>
  );
}

export default Index;
