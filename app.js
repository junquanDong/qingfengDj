const ids = require('./ids')
const utils = require('./utils')
const request = require('request')
const path = require('path')

// const id = 237333



async function getMusic(_ids, idx = 1) {
  console.log('当前进度: ' + idx)
  let _id = _ids[0]
  const _t = Date.now()
  const _url = `https://www.vvvdj.com/play/${_id}.html`
  const { title, m3u8 } = await utils.getM3u8(_url)
  const mp4Res = await utils.ffmpeg({title, m3u8url: m3u8})
  if (mp4Res.code === 200) {
    const mp3Res = await utils.mp4Tomp3(mp4Res.path)
    if (mp3Res.code === 200) {
      const outputPath = path.resolve(__dirname, 'output/')
      utils.syncCommand(`mv ${mp3Res.path} ${outputPath}`)
    }
  }
  console.log((Date.now() - _t) / 1000 + 's')

  const newIds = _ids.slice(1)
  if (newIds.length) {
    getMusic(newIds, idx + 1)
  }
}

utils.resetDir(path.resolve(__dirname, '_output'));
console.log('总下载条数: ' + ids.length)
getMusic(ids)


