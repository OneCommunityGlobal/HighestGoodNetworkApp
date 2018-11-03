const {Builder, By, Key, until} = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
require("chromedriver");
require("geckodriver")

describe("should login", async()=> {

let driver;
let rootURL = "https://hgnapplication_react_dev.surge.sh";

    
    beforeEach( async ()=> {
        driver =  await new webdriver.Builder().forBrowser('chrome').build();
        await driver.navigate().to(rootURL)
    })
    afterEach( async()=> {
        await driver.close();
        await localStorage.clear()
    })

    it("should display error if email is not in a valid format",  async()=> {       
       let emailWebElement =   await driver.findElement(By.id("email"));      
       await emailWebElement.sendKeys("fhsddg");
       let errorElement =await driver.findElement(By.className("alert"));
       let error = await errorElement.getAttribute("innerHTML")
       expect(error).toEqual('"Email" must be a valid email');  
    })

    it("should display error if password is empty",  async()=> {       
        let passwordWebElement =   await driver.findElement(By.id("password"));      
        await passwordWebElement.sendKeys("f");
        await passwordWebElement.sendKeys(Key.BACK_SPACE);
        let errorElement =await driver.findElement(By.className("alert"));
        let error = await errorElement.getAttribute("innerHTML")
        expect(error).toEqual('"Password" is not allowed to be empty');  
     })

     it.only("should show alert if wrong credentials are passed",  async()=> {
        let emailWebElement =   await driver.findElement(By.id("email"));
        await emailWebElement.click() 
        await emailWebElement.sendKeys("randomuser@gmail.com");
        
        let passwordWebElement =   await driver.findElement(By.id("password")); 
        passwordWebElement.click();     
        await passwordWebElement.sendKeys("f");

        let buttonWebElement = await driver.findElement(By.tagName("button"))
        await buttonWebElement.click();
       

        let errorElement =await driver.findElement(By.className("alert"));
        let error = await errorElement.getAttribute("innerHTML")
        expect(error).toEqual('"Password" is not allowed to be empty');  
     })

})