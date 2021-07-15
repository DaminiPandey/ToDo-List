const express=require("express")
const app=express()
const _ = require("lodash")
const mongoose = require("mongoose")
const bodyParser=require("body-parser")
const ejs =require("ejs")
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extented:true}))
app.use(express.static("public"))
// var items=[]
mongoose.connect("mongodb+srv://admin-damini:test-123@cluster0.jugbm.mongodb.net/todolistDB?retryWrites=true&w=majority" , {useNewUrlParser:true})
var item
const itemsSchema=new mongoose.Schema({name:String})
const Item = mongoose.model("Item",itemsSchema)
const item1 = new Item ({
  name:"Welcome to your todolist!"
})
const item2 = new Item ({
  name:"Hit the + button to add a new item."
})
const item3 = new Item({
  name:"<-- Hit this to delete an item."
})
const defaultItems =[item1,item2,item3];

app.get("/",function(req,res){
  var date=new Date()
  // var currentDay=date.getDay()
  var options={weekday:"long",day:"numeric",month:"long"}
  var day=date.toLocaleDateString("en-US",options)
  Item.find({},function(err,results){
    if(results.length === 0){
     Item.insertMany(defaultItems,function(err){
       if(err){
         console.log(err)
       } else{
         console.log('Successfully added the default items into the database.')
       }

     })
      res.redirect("/")
    }
    else(
        res.render("list",{kindOfDay:day,newListItems:results})
    )
  })




})
app.post("/",function(req,res){
   const itemName =req.body.newItem
   const listName= req.body.list
     var date=new Date()
     var options={weekday:"long",day:"numeric",month:"long"}
     var day=date.toLocaleDateString("en-US",options)
   const item = new Item ({
     name: itemName
   })
   if(listName==day){
     item.save()
      res.redirect("/")
   }else{
     List.findOne({name:listName},function(err,foundList){
       foundList.items.push(item)
       foundList.save()
       res.redirect("/" + listName)
     })
   }

})
app.post("/delete",function(req,res){
  var date=new Date()
  // var currentDay=date.getDay()
  var options={weekday:"long",day:"numeric",month:"long"}
  var day=date.toLocaleDateString("en-US",options)
  const checkedItemId = req.body.checkbox
  const listName= req.body.listName
  if(listName===day){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err)
      }else{
        console.log(checkedItemId+" Successfully removed")

      }
      res.redirect("/")
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull :{items:{_id:checkedItemId}}} , function(err,foundList){
      if(!err){
        res.redirect("/" + listName)
      }
    })
  }

})
const listSchema = new mongoose.Schema({name:String, items:[itemsSchema]})
const List = mongoose.model("List",listSchema)

app.get("/:customListName" , function(req,res){
   const customList=  _.capitalize(req.params.customListName)
   List.findOne({name: customList},function(err,foundList){
     if(!err){
       if(!foundList){
         //create a list
         const list = new List({
           name: customList,
           items: defaultItems
         })
         list.save()
         res.redirect("/" + customList)
       }else{
         //show an existing list
         res.render("list",{kindOfDay:customList ,newListItems:foundList.items})

       }
     }
   })

})



















app.listen(process.env.PORT||3000,function(){
 console.log("The server is running on port 3000.")
  })
