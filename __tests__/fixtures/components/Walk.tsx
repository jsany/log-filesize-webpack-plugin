import React from 'react';
import { generateRandom } from '@/utils/index';
import pkg from '@/assets/pkg.json';
import ImgNpm from '@/assets/npm.jpeg';

function Walk() {
  console.log('== Walk ==', generateRandom(10));

  return (
    <>
      <img src={ImgNpm} alt="npm" />
      <h3>I am walk 👣</h3>
      <pre>
        <code>{JSON.stringify(pkg, null, 2)}</code>
      </pre>
    </>
  );
}

export default Walk;
