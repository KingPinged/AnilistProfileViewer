const express = require('express')
const path = require('path')
const anilist = require('anilist-node');
const Database = require("@replit/database")
const db = new Database()

const Anilist = new anilist();
const app = express()

const fs = require('fs')
const Canvas = require('canvas')
Canvas.registerFont(`assets/fonts/theboldfont.ttf`, { family: "Bold" });
// Register SketchMatch font
Canvas.registerFont(`assets/fonts/SketchMatch.ttf`, { family: "SketchMatch" });
// Register SketchMatch font
Canvas.registerFont(`assets/fonts/LuckiestGuy-Regular.ttf`, { family: "luckiest guy" });
// Register KeepCalm font
Canvas.registerFont(`assets/fonts/KeepCalm-Medium.ttf`, { family: "KeepCalm" });

let todaysViews = {}
setInterval(function(){todaysViews = {}}, 1000 * 60 * 60 * 24);


app.get('/:file', async (req, res) => {
  let sliced = (req.params.file).slice(0, -4)
  let userData = await Anilist.user.profile(sliced).catch(err => {return Error() })

  let userVisits = await db.get(sliced) || []
  let ip = req.connection.remoteAddress.split(`:`).pop();

  if(!userVisits.includes(ip)){
    userVisits.push(ip)
    db.set(sliced, userVisits)
    todaysViews[sliced] ? todaysViews[sliced]++  : todaysViews[sliced] = 1
  }
  console.log(ip)

  await create(userData, userVisits.length)

  let p = path.join(__dirname, 'public/'+ sliced + '.png');
  res.sendFile(p)
})

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

async function create(data,visits){

  let stats = await Anilist.user.stats(data.name).catch(err => {return Error() })

  const width =900
  const height = 750

  const backgroundImage = data.bannerImage || `assets/img/1px.png`;
 const username = data.name;
 const addonReputation = true;
 const colorBackground = "#000000";
const  colorLevelBox = "#ff7b4b";
 const colorReputationBox = "#ff7b4b";
 const colorLevel = "#ffffff";
 const colorUsername = "#ffffff";
 const colorReputation = "#ffffff";
 const colorBackgroundBar = "#000000";
const  colorBar = "#ffffff";
const  radiusCorner = "20";
 const opacityAvatar = "0.4";
const  opacityLevel = "1";
 const opacityBackgroundBar = "0.4";
 const opacityReputation = "1";

 let canvas = Canvas.createCanvas(width, height),
      ctx = canvas.getContext("2d");

    const lvlText = visits + " views";
    const repText = (todaysViews[data.name] || 1) + " today";

    // Background
    ctx.beginPath();
    ctx.moveTo(0 + Number(radiusCorner), 0);
    ctx.lineTo(0 + width - Number(radiusCorner), 0);
    ctx.quadraticCurveTo(0 + width, 0, 0 + width, 0 + Number(radiusCorner));
    ctx.lineTo(0 + width, 0 + height - Number(radiusCorner));
    ctx.quadraticCurveTo(
      0 + width,
      0 + height,
      0 + width- Number(radiusCorner),
      0 + height
    );
    ctx.lineTo(0 + Number(radiusCorner), 0 + height);
    ctx.quadraticCurveTo(0, 0 + height, 0, 0 + height - Number(radiusCorner));
    ctx.lineTo(0, 0 + Number(radiusCorner));
    ctx.quadraticCurveTo(0, 0, 0 + Number(radiusCorner), 0);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = colorBackground;
    ctx.fillRect(0, 0, width, height);
    let background = await Canvas.loadImage(backgroundImage);
    ctx.drawImage(background, 0, 0, width, height);
    ctx.restore();

    // Draw layer
    ctx.fillStyle = "#000000";
    ctx.globalAlpha = opacityAvatar;
    ctx.fillRect(50, 0, 240, canvas.height);
    ctx.globalAlpha = 1;

    // Avatar
    let avatar = await Canvas.loadImage(data.avatar.medium);
    ctx.drawImage(avatar, 50 + 30, 30, 180, 180);


    // Views Forever
    ctx.fillStyle = colorLevelBox;
    ctx.globalAlpha = opacityLevel;
    ctx.fillRect(50 + 30, 30 + 180 + 30 , 180, 100);
    ctx.globalAlpha = 1;
    ctx.fillStyle = colorLevel;
    ctx.font = applyText(canvas, lvlText, 32, 250, "Bold");
    ctx.textAlign = "center";
    ctx.fillText(lvlText, 50 + 30 + 180 / 2, 30 + 180 + 30 + 38 + 25);

    // Views Today
      ctx.fillStyle = colorReputationBox;
      ctx.globalAlpha = opacityReputation;
      ctx.fillRect(50 + 30, 30 + 180 + 30 + 50 + 30 + 50, 180, 100);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colorReputation;
      ctx.font = applyText(canvas, repText, 52, 250, "Bold");
      ctx.textAlign = "center";
      ctx.fillText(repText, 50 + 30 + 180 / 2, 30 + 180 + 30 + 30 + 50 + 38 + 75);


    // anime total
      ctx.fillStyle = colorReputationBox;
      ctx.globalAlpha = opacityReputation;
      ctx.fillRect(50 + 30, 30 + 180 + 30 + 50 + 30 + 200, 180, 100);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colorReputation;
      ctx.font = applyText(canvas, repText, 32, 70, "Bold");
      ctx.textAlign = "center";
      ctx.fillText(stats.anime.count + " anime watched", 50 + 30 + 180 / 2, 30 + 180 + 30 + 30 + 50 + 38 + 220);
    

    // Username
    ctx.textAlign = "left";
    ctx.fillStyle = colorUsername;
    ctx.font = applyText(canvas, username, 45, 460, "Bold");
    ctx.fillText(username, 50 + 240 + 45 + 5, 80);


const buffer = canvas.toBuffer('image/png')

await fs.writeFileSync('./public/'+data.name+'.png', buffer)

return true

}


    function applyText(canvas, text, defaultFontSize, width, font){
        const ctx = canvas.getContext("2d");
        do {
            ctx.font = `${(defaultFontSize -= 1)}px ${font}`;
        } while (ctx.measureText(text).width > width);
        return ctx.font;
    }