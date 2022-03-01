const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");  //USER DEFINED MODULE
const mongoose  = require("mongoose");
const _ = require("lodash");
const app = express();

// var items = [];
// var workItems = [];
// var groceryItems = [];
// var shoppingItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Harshitj21102000:7CnZsWCB8AugJ99@harshit21.x09pt.mongodb.net/listifyDB");

// const day = date.getDate();

const itemsSchema = {
	name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = {
	name: "Hello! Welcome to the Listify Web App.."
};
const item2 = {
	name: "Click + button to add the item in the current List"
};
const item3 = {
	name: "<--Click this button to delete the item from the current List"
};

const defaultItems = [item1,item2,item3];

const listSchema = {
	name: String,
	items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/",function(req,res){
    
    const day = "Today";

    var lists;
    List.find({},function(err,foundLists){
	if(!err){
		lists = foundLists;
	}
	else{
		console.log(err);
	}

    });

    Item.find(function(err,foundItems){
    	if(foundItems.length===0){
    		Item.insertMany(defaultItems,function(err){
            	if(err){
            		console.log(err);
            	}else{
            		console.log("Successfully added the records");
            	}
            });
            res.redirect("/");
    	}
    	else{
    		 res.render('list' , {ListTitle: day, newListItems: foundItems, navLists: lists});
    	}
    });
   
});


app.get("/:customListName",function(req,res){

	var lists;
    List.find({},function(err,foundLists){
	if(!err){
		lists = foundLists;
	}
	else{
		console.log(err);
	}

   });



	const customListName = _.capitalize(req.params.customListName);

	List.findOne({name: customListName},function(err,foundList){
		if(!err){
			if(!foundList){
				const list = new List({
		           name: customListName,
		           items: defaultItems
	            });
	            list.save();
	            res.redirect("/"+customListName);
			}else{
				res.render('list',{ListTitle: foundList.name, newListItems: foundList.items, navLists: lists});
			}
		}
		else{
			console.log(err);
		}
	});
	
});

app.post("/",function(req,res){
	var newItem = req.body.newItem;
	var listName = req.body.list;

	const item = new Item({
		name: newItem
	});

	if(listName === "Today"){
		item.save();
		res.redirect("/");
	}
	else{
		List.findOne({name: listName},function(err,foundList){
			foundList.items.push(item);
			foundList.save();
			res.redirect("/"+listName);
		});
	}

	// if(list==="Work"){
	// 	workItems.push(item);
	// 	res.redirect("/work");
	// }
	// else if(list==="Grocery"){
	// 	groceryItems.push(item);
	// 	res.redirect("/grocery");
	// }
	// else if(list==="Shopping"){
	// 	shoppingItems.push(item);
	// 	res.redirect("/shopping");
	// }
	// else{
	// 	items.push(item);
	// 	res.redirect("/");
	// }

	
});

app.post("/delete",function(req,res){
	const checkedItemId = req.body.checkbox;
	const listName = req.body.listName;

	if(listName==="Today"){
		Item.findByIdAndRemove(checkedItemId,function(err){
		if(err){
			console.log(err);
		}else{
			console.log("Successfully deleted the checked item.");
	        res.redirect("/");
		}
	   });
	}
	else{
		//From Custom lists
		List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}},function(err,foundList){
			if(!err){
				res.redirect("/"+listName);
			}
		});
	}
});

app.post("/addNewList",function(req,res){
	const newList = _.capitalize(req.body.newList);
	console.log(newList);

	var lists;
    List.find({},function(err,foundLists){
	if(!err){
		lists = foundLists;
	}
	else{
		console.log(err);
	}

   });


	List.findOne({name: newList},function(err,foundList){
		if(!err){
			if(!foundList){
				const list = new List({
		           name: newList,
		           items: defaultItems
	            });
	            list.save();
	            res.redirect("/"+newList);
			}else{
				res.render('list',{ListTitle: foundList.name, newListItems: foundList.items, navLists: lists});
			}
		}
		else{
			console.log(err);
		}
	});
});


app.post("/deleteList",function(req,res){
	const listName = req.body.listName;

	if(listName==="Today"){
		Item.deleteMany({},function(err){
			if(!err){
				res.redirect("/");
			}else{
				console.log(err);
			}
		});
	}
	else{
		List.deleteOne({name: listName},function(err){
		   if(err){
			   console.log(err);
		   }
		   else{
			   res.redirect("/");
		   }
	    });
	}
});

// app.get("/work",function(req,res){
// 	res.render('list', {ListTitle: "Work List", newListItems: workItems});
// });

// app.get("/grocery",function(req,res){
// 	res.render('list', {ListTitle: "Grocery List", newListItems: groceryItems});
// });

// app.get("/shopping",function(req,res){
// 	res.render('list',{ListTitle: "Shopping List", newListItems: shoppingItems});
// });

// app.get("/about",function(req,res){
// 	res.render("about");
// }


app.listen(3000,function(){
	console.log("Server started on Port 3000");
});