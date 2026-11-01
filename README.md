# Snapcode

Snapcode is a block-based visual programming editor, built as a fork of the open-source
[`scratch-gui`](https://github.com/scratchfoundation/scratch-gui) from the Scratch Foundation.

Snapcode is an independent project. It is not affiliated with, endorsed by, or sponsored by
the Scratch Team, the Scratch Foundation, or MIT. "Scratch", the Scratch logo and the Scratch
Cat are trademarks of MIT (see [TRADEMARK](./TRADEMARK)).

## Run locally

Requires Node.js 22 and an internet connection for the first `npm install`
(it downloads a micro:bit firmware file).

```bash
npm install
npm start        # dev server at http://localhost:8601
npm run build    # production build into ./build
```

## Deploy (Vercel)

`vercel.json` already sets the install command, build command and output directory (`build`).
Import this repository in Vercel and deploy with the defaults.

## License

Snapcode is licensed under the [GNU Affero General Public License v3.0](./LICENSE),
the same license as the upstream project. If you run a modified version as a public web
service, the AGPL requires you to offer your users the corresponding source code, so keep a
link to this repository visible in the app. Original copyright notices must stay in place.

The original upstream README is kept in [UPSTREAM-README.md](./UPSTREAM-README.md).
