const request = require('request')
const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
const { execSync } = child_process
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const basePath = __dirname
const souce = path.join(basePath, 'souce')

function DeCode () {
  this.OO0O00OO00OO = function (a, b) {
      return b > 0 ? a.substring(0, b) : null;
  }, this.OO00OO0O00O0 = function (a, b) {
      return a.length - b >= 0 && a.length >= 0 && a.length - b <= a.length ? a.substring(a.length - b, a.length) : null;
  }, this.O0000OO0OO00O0 = function (a, b) {
      var c, d, e, f, g, h, i, j, k = "";
      for (c = 0; c < b.length; c++) {
          k += b.charCodeAt(c).toString();
      }
      for (d = Math.floor(k.length / 5), e = parseInt(k.charAt(d) + k.charAt(2 * d) + k.charAt(3 * d) + k.charAt(4 * d) + k.charAt(5 * d)),
               f = Math.round(b.length / 2), g = Math.pow(2, 31) - 1, h = parseInt(a.substring(a.length - 8, a.length), 16),
               a = a.substring(0, a.length - 8), k += h; k.length > 10; ) {
          k = (parseInt(k.substring(0, 10)) + parseInt(k.substring(10, k.length))).toString();
      }
      for (k = (e * k + f) % g, i = "", j = "", c = 0; c < a.length; c += 2) {
          i = parseInt(parseInt(a.substring(c, c + 2), 16) ^ Math.floor(255 * (k / g))), j += String.fromCharCode(i),
              k = (e * k + f) % g;
      }
      return j;
  }, this.O0000OO0OO00O = function (a, b, c) {
      return a.length >= 0 ? a.substr(b, c) : null;
  }, this.O0O000000O0O0 = function (a) {
      return a.length;
  }, this.O000O0OO0O0OO = function (a,b) {          
      var h, i, j, k, l, m, n, o, p, c = b, d = this.O0O000000O0O0(c), e = d, f = new Array(), g = new Array();
      for (l = 1; d >= l; l++) {
          f[l] = this.O0000OO0OO00O(c, l - 1, 1).charCodeAt(0), g[e] = f[l], e -= 1;
      }
      for (h = "", i = a, m = this.OO0O00OO00OO(i, 2), i = this.OO00OO0O00O0(i, this.O0O000000O0O0(i) - 2),
               l = 0; l < this.O0O000000O0O0(i); l += 4) {
          j = this.O0000OO0OO00O(i, l, 4), "" != j && (b = this.OO0O00OO00OO(j, 1), k = (parseInt(this.OO00OO0O00O0(j, 3)) - 100) / 3,
              m == this.O0000OO0OO00O0("a9ab044c634a", "O0000OO0OO00O") ? (n = 2 * parseInt(b.charCodeAt(0)),
                  o = parseInt(f[k]), p = n - o, h += String.fromCharCode(p)) : (n = 2 * parseInt(b.charCodeAt(0)),
                  o = parseInt(g[k]), p = n - o, h += String.fromCharCode(p)));
      }
      return h;
  };
}

function getM3u8 (a,b) {
  const x = new DeCode()
  return  x.O000O0OO0O0OO(a,b)
}

// 添加目录
function addDir (_path) {
  if (!fs.existsSync(_path)) {
    fs.mkdirSync(_path);
  }
};

function writeFile (path, contents) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, contents, 
      function(err) {  
        if (err) throw err; 
        resolve()
      }
    );
  })
}

function resetDir (_path) {
  if (fs.existsSync(_path)) {
    fs.rmdirSync(_path, { recursive: true });
  }
  fs.mkdirSync(_path);
};


// const m3u8Start = m3u8url.split('.m3u8')[0].slice(0, ~(String(_id).length - 1))
// const ts = await utils.getM3u8Ts(m3u8url)
// const loadTsStatus = await utils.loadTs({
//   base: m3u8Start,
//   ts,
//   id: _id
// })

module.exports = {
  getM3u8: (_url) => {
    return new Promise((resolve, reject) => {
      request.get(_url, (err, res, body) => {
        const titleStartIdx = body.indexOf('<title>')
        const titleEndIdx = body.indexOf('</title>')
        const title = body.slice(titleStartIdx + 7, titleEndIdx).split(',')[0]

        console.log(title)
        // const _res = JSON.parse(body)
        const startIdx = body.indexOf('playurl=x.O000O0OO0O0OO(')
        let _body = body.slice(startIdx + 24)
        const endIdx = _body.indexOf(');')
        const params = _body.slice(0, endIdx).split(',').map(v => v.slice(1, -1))
        const m3u8 = getM3u8(...params)
  
        resolve({
          title,
          m3u8: `https:${m3u8}`
        }) 
      })
    })
  },
  getM3u8Ts: (m3u8Url) => {
    return new Promise((resolve, reject) => {
      request.get(m3u8Url, (err, res, body) => {
        const ts = String(body).replace(/\n/g, '').split(/#[A-Z:\.0-9]*,/).slice(1)
        if (ts && ts.length) {
          ts[ts.length - 1] = ts[ts.length - 1].split('#')[0]
        }
        resolve(ts) 
      })
    })
  },
  loadTs: async ({base, ts, id, resetStatus = 0}) => {
    const _baseTsPath = path.resolve(souce, String(id))
    const promiseAll = []
    const errTs = []
    addDir(souce)
    addDir(_baseTsPath)
    if (resetStatus === 0) {
      resetDir(_baseTsPath)
    }

    ts.forEach(item => {
      promiseAll.push(
        new Promise((resolve, reject) => {
          request.get(base + item, async(err, res, body) => {
            // console.log(body)
            if (!err) {
              await writeFile(path.resolve(souce, String(id), item.split('?')[0]), body)
              resolve(true)
            } else {
              errTs.push(item)
              reject(err)
            }
          })
        })
      )
    })

    
    const res = await Promise.all(promiseAll)

    if (res.every(v => String(v) === 'true')) {
      return {
        code: 200,
        path: _baseTsPath,
        status: 'success'
      }
    } else {
      return this.loadTs({
        base, id, resetStatus: 1, ts: errTs
      })
    }
  },
  ffmpeg: ({title, m3u8url}) => {
    const outputDir = path.resolve(basePath, '_output')
    addDir(outputDir)
    const outputPath = path.resolve(outputDir, `${title}.mp4`)
    return new Promise((resolve, reject) => {
      ffmpeg(m3u8url)
        .on("error", error => {
          console.log(error)
          reject(error)
        })
        .on("end", () => {
          resolve({
            path: outputPath,
            code: 200,
            status: 'success'
          })
        })
        .outputOptions("-c copy")
        .outputOptions("-bsf:a aac_adtstoasc")
        .output(outputPath)
        .run();
    })
  },
  mp4Tomp3: (path) => {
    const mp3Path = path.replace('.mp4', '.mp3')
    return new Promise((resolve, reject) => {
      ffmpeg({source: path})
        .on("end", () => {
          resolve({
            code: 200,
            status: 'success',
            path: mp3Path
          })
        })
        .toFormat('mp3')
        .saveToFile(mp3Path)
    })
  },
  syncCommand: (command, options) => {
    const win32 = process.platform === "win32"; 
    const cmd = win32 ? "cmd" : command;
    return execSync(cmd, options).toString().trim()
  },
  resetDir
}