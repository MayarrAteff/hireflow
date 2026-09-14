const isGenerated = (file) => file.endsWith('routeTree.gen.ts');

module.exports = {
  '**/*.{js,jsx,ts,tsx}': (files) => {
    const lintable = files.filter((file) => !isGenerated(file));
    return lintable.length
      ? [`eslint --max-warnings=0 --fix ${lintable.join(' ')}`, `prettier -w ${lintable.join(' ')}`]
      : [];
  },
  '**/*.{json,css,scss,md}': 'prettier -w',
};
