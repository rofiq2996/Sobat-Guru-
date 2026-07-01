import fs from 'fs';
// A 1x1 transparent PNG base64
const transparentPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";

fs.writeFileSync('public/pwa-192x192.png', Buffer.from(transparentPng, 'base64'));
fs.writeFileSync('public/pwa-512x512.png', Buffer.from(transparentPng, 'base64'));
fs.writeFileSync('public/apple-touch-icon.png', Buffer.from(transparentPng, 'base64'));

console.log('Icons generated');
