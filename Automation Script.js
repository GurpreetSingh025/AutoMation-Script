// node AutomationProject.js --url="https://www.hackerrank.com/dashboard" --config="automation.json"

let fs = require("fs");
let minimist = require("minimist");
let path = require("path");
let puppeteer = require("puppeteer");

let input = minimist(process.argv);
let desiredUrl = input.url;
let configs = fs.readFileSync(input.config);
let UsableConfig = JSON.parse(configs); 

async function run(){
    let browser = await puppeteer.launch({
        defaultViewport : null ,
        headless : false ,
        args:[
            '--start-maximized'
        ] ,
        isMobile: false                            
    });
     
    let page = await browser.newPage();
    page.setViewport({width : 1600 , height : 900});
    await page.goto(input.url);

    // login to account by automation

    await page.waitForSelector("button.login.pull-right.btn.btn-dark.btn-default.mmT");
    await page.click("button.login.pull-right.btn.btn-dark.btn-default.mmT");

    
     //typing email and password by automation
    await page.type("input[placeholder='Your username or email']",UsableConfig.email , {delay : 50});
    await page.type("input[placeholder='Your password']" , UsableConfig.password , {delay : 50});
    
    //pressing to login after typing email and password
    await page.click("button[type='submit']>div.ui-content.align-icon-right>span.ui-text");

    //After login going to compete section in order to access contests
    await page.waitForTimeout(3000);
    await page.click("a[href='/contests']");
    
    //going to manage contest section 
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    //Adding moderator 
   await page.waitForSelector("a.backbone.block-center")
   let All_Contest_Urls_Of_A_page = await page.$$eval("a.backbone.block-center" , function(aTags){
       let urls = [];
       for(let i=0; i<aTags.length ; i++){
           console.log(aTags[i].textContent)
           let url = aTags[i].getAttribute("href");
           urls.push(url);
       }      
       return urls;
   });

   for(let i=0;i<All_Contest_Urls_Of_A_page.length ; i++){       
       let page2 = await browser.newPage();
       await page2.setViewport({width : 1600 , height : 900});
       await page2.bringToFront();
       await page2.goto("https://www.hackerrank.com"+All_Contest_Urls_Of_A_page[i]);
       await AddModerator(page2);
       await page2.close();
   }
   
  // console.log("content is : " + All_Contest_Urls_Of_A_page);
   await browser.close();

}

async function AddModerator(page){
    await page.waitForTimeout(3000);
    await page.click("li[data-tab='moderators']");
    
    for(let i=0; i<UsableConfig.moderator.length ; i++){
    await page.waitForSelector("input#moderator");        
    await page.type("input#moderator" , UsableConfig.moderator[i] , {delay : 100});
    await page.keyboard.press("Enter");
    }  
    await page.waitForTimeout(2000);    
}

run();
