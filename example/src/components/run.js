import React from 'react';
import { generateRandom } from '../utils/index';
import pkg from '../assets/pkg.json';
import ImgJsany from '../assets/jsany.png';

function Run() {
  console.log(generateRandom(10));

  return (
    <>
      <img src={ImgJsany} alt="jsany" />
      <h3>I am run 👟</h3>
      <pre>
        <code>{JSON.stringify(pkg, null, 2)}</code>
      </pre>
    </>
  );
}

export default Run;
