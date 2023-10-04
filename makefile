all: code-min.js

code.js: code.ts
	tsc code.ts -t es6

code-min.js: code.js
	google-closure-compiler -O ADVANCED code.js > code-min.js

clean:
	rm code.js code-min.js