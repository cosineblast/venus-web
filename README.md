
# venus-web

If it ever happens to be finished, this project is going to be an
interactive graph-based programming enviroment backed by nushell.

## building and running

You can run the development build by cloning the repo and executing `npm run dev`.

However, it is likely the web application won't work, because it requries the
`.wasm` nushell binary and its JS bindings.

This can be accomplished by following the build instructions of
the [nushell fork](https://github.com/cosineblast/venus-nushell)
and moving the generated `pkg` directory inside the `venus-wrapper` crate into `src/nu`.

i.e `mv $nushell_fork/crates/venus-wrapper/pkg ./src/nu`



