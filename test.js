var str = `http://res.cloudinary.com/dmykkmqwz/video/upload/v1723372365/audios/cd9vk3clyzat8eitd1rw.mp3`;
const startIndex = str.indexOf('audios');
const splited = str.substring(startIndex, str.length);

console.log(splited);
