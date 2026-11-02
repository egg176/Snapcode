/**
 * Snapcode Tools: a small extension that ships with Snapcode.
 *
 * This file is loaded inside the extension worker (see extension-worker.js in the build output),
 * which provides the global `Scratch` object. It is plain JavaScript and is not processed by webpack.
 * Edit it, push, and Vercel redeploys it.
 */
(function () {
    'use strict';

    const ArgumentType = Scratch.ArgumentType;
    const BlockType = Scratch.BlockType;

    const pad = n => String(n).padStart(2, '0');

    class SnapcodeTools {
        getInfo () {
            return {
                id: 'snapcodeTools',
                name: 'Snapcode Tools',
                color1: '#5A54E0',
                color2: '#4640BE',
                color3: '#3B3599',
                blocks: [
                    {
                        opcode: 'uppercase',
                        blockType: BlockType.REPORTER,
                        text: 'uppercase [TEXT]',
                        arguments: {
                            TEXT: {type: ArgumentType.STRING, defaultValue: 'snapcode'}
                        }
                    },
                    {
                        opcode: 'reverse',
                        blockType: BlockType.REPORTER,
                        text: 'reverse [TEXT]',
                        arguments: {
                            TEXT: {type: ArgumentType.STRING, defaultValue: 'snapcode'}
                        }
                    },
                    {
                        opcode: 'isPalindrome',
                        blockType: BlockType.BOOLEAN,
                        text: 'is [TEXT] a palindrome?',
                        arguments: {
                            TEXT: {type: ArgumentType.STRING, defaultValue: 'level'}
                        }
                    },
                    '---',
                    {
                        opcode: 'randomColor',
                        blockType: BlockType.REPORTER,
                        text: 'random hex color'
                    },
                    {
                        opcode: 'now',
                        blockType: BlockType.REPORTER,
                        text: 'current [PART]',
                        arguments: {
                            PART: {type: ArgumentType.STRING, menu: 'dateParts', defaultValue: 'time'}
                        }
                    },
                    '---',
                    {
                        opcode: 'logToConsole',
                        blockType: BlockType.COMMAND,
                        text: 'log [TEXT] to the browser console',
                        arguments: {
                            TEXT: {type: ArgumentType.STRING, defaultValue: 'Hello from Snapcode!'}
                        }
                    }
                ],
                menus: {
                    dateParts: {
                        acceptReporters: true,
                        items: ['time', 'date']
                    }
                }
            };
        }

        uppercase (args) {
            return String(args.TEXT).toUpperCase();
        }

        reverse (args) {
            return Array.from(String(args.TEXT)).reverse()
                .join('');
        }

        isPalindrome (args) {
            const cleaned = String(args.TEXT).toLowerCase()
                .replace(/[^\p{L}\p{N}]/gu, '');
            if (cleaned.length === 0) return false;
            return cleaned === Array.from(cleaned).reverse()
                .join('');
        }

        randomColor () {
            let hex = '';
            for (let i = 0; i < 6; i++) {
                hex += Math.floor(Math.random() * 16).toString(16);
            }
            return `#${hex.toUpperCase()}`;
        }

        now (args) {
            const d = new Date();
            if (String(args.PART) === 'date') {
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            }
            return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        }

        logToConsole (args) {
            console.log(`[Snapcode] ${String(args.TEXT)}`); // eslint-disable-line no-console
        }
    }

    Scratch.extensions.register(new SnapcodeTools());
}());
