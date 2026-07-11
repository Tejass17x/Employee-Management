const Employee = require("../models/Employee");


// GET ALL EMPLOYEES

exports.getEmployees = async(req,res)=>{

try{

const employees = await Employee.findAll();

res.json(employees);

}
catch(error){

res.status(500).json({
message:error.message
});

}

};




// ADD EMPLOYEE

exports.addEmployee = async(req,res)=>{

try{

const employee = await Employee.create(req.body);

res.json(employee);

}
catch(error){

res.status(500).json({
message:error.message
});

}

};





// DELETE EMPLOYEE

exports.deleteEmployee = async(req,res)=>{

try{

await Employee.destroy({

where:{
id:req.params.id
}

});


res.json({
message:"Employee deleted"
});


}
catch(error){

res.status(500).json({
message:error.message
});

}

};




// UPDATE EMPLOYEE

exports.updateEmployee = async(req,res)=>{

try{

await Employee.update(
req.body,
{
where:{
id:req.params.id
}
}
);


res.json({
message:"Employee updated"
});


}
catch(error){

res.status(500).json({
message:error.message
});

}

};