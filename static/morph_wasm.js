if (!WebAssembly.instantiateStreaming) { // polyfill
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
    };
}
const go = new Go();
WebAssembly.instantiateStreaming(fetch("https://ikawaha.github.io/kagome/kagome.wasm"), go.importObject).then((result) => {
    go.run(result.instance);
}).catch((err) => {
    console.error(err);
});
