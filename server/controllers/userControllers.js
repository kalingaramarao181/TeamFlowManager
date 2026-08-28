const User = require("../models/userModels");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByEmail(req.user.email);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      position_id: user.position_id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userPermissions = await User.getResourceAccessForUser(user.id);
    const userPositionId = await User.getCurrentPositionId(user.id);

    res.status(200).json({
      id: user.id,
      fullName: user.full_name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      position_id: userPositionId || user.position_id,
      permissions: userPermissions,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    const users = await User.getAllUsers(skip, limit, search);
    const totalCount = await User.getUsersCount(search);
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ users, totalPages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserManagementDetails = async (req, res) => {
  try {
    const [users, positions, resources] = await Promise.all([
      User.findAllUsers(),
      User.listPositions(),
      User.listResources(),
    ]);

    res.status(200).json({ users, positions, resources });
  } catch (error) {
    res.status(500).json({ message: "Failed to load user management data", error: error.message });
  }
};

const createResource = async (req, res) => {
  const { name, resource_key, description, is_default } = req.body;

  if (!name || !resource_key) {
    return res.status(400).json({ message: "Name and resource key are required" });
  }

  try {
    const result = await User.createResource({ name, resource_key, description, is_default });
    res.status(201).json({ message: "Resource created successfully", result });
  } catch (error) {
    res.status(500).json({ message: "Failed to create resource", error: error.message });
  }
};

const updateResource = async (req, res) => {
  const { resourceId } = req.params;
  const { name, resource_key, description, is_default } = req.body;

  if (!name || !resource_key) {
    return res.status(400).json({ message: "Name and resource key are required" });
  }

  try {
    await User.updateResource(Number(resourceId), { name, resource_key, description, is_default });
    res.status(200).json({ message: "Resource updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update resource", error: error.message });
  }
};

const deleteResource = async (req, res) => {
  const { resourceId } = req.params;

  try {
    await User.deleteResource(Number(resourceId));
    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete resource", error: error.message });
  }
};

const createPosition = async (req, res) => {
  const { name, slug, description } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ message: "Position name and slug are required" });
  }

  try {
    const result = await User.createPosition({ name, slug, description });
    res.status(201).json({ message: "Position created successfully", result });
  } catch (error) {
    res.status(500).json({ message: "Failed to create position", error: error.message });
  }
};

const updatePosition = async (req, res) => {
  const { positionId } = req.params;
  const { name, slug, description } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ message: "Position name and slug are required" });
  }

  try {
    await User.updatePosition(Number(positionId), { name, slug, description });
    res.status(200).json({ message: "Position updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update position", error: error.message });
  }
};

const deletePosition = async (req, res) => {
  const { positionId } = req.params;

  try {
    await User.deletePosition(Number(positionId));
    res.status(200).json({ message: "Position deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete position", error: error.message });
  }
};

const updateUserPosition = async (req, res) => {
  const { userId } = req.params;
  const { position_id } = req.body;

  if (!position_id) return res.status(400).json({ message: "Position is required" });

  try {
    await User.assignUserPosition(Number(userId), Number(position_id), req.user.id);
    await new Promise((resolve,reject)=>require('../Config/connection').query('UPDATE users SET position_id=? WHERE id=?',[Number(position_id),Number(userId)],(e)=>e?reject(e):resolve()));

    res.status(200).json({ message: "User position updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user position", error: error.message });
  }
};

const updateUserPermissions = async (req, res) => {
  const { userId } = req.params;
  const { resource_key, can_view, can_create, can_edit, can_delete, can_assign } = req.body;

  if (!resource_key) return res.status(400).json({ message: "Resource key is required" });

  try {
    const resource = await User.getResourceByKey(resource_key);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    await User.upsertUserPermission(Number(userId), resource.id, {
      can_view: Boolean(can_view),
      can_create: Boolean(can_create),
      can_edit: Boolean(can_edit),
      can_delete: Boolean(can_delete),
      can_assign: Boolean(can_assign),
    }, req.user.id);

    res.status(200).json({ message: "User permissions updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user permissions", error: error.message });
  }
};

const assignUserProject = async (req, res) => {
  const { userId } = req.params;
  const { project_id } = req.body;

  if (!project_id) return res.status(400).json({ message: "Project ID is required" });

  try {
    await User.assignProjectToUser(Number(userId), Number(project_id), req.user.id);
    res.status(200).json({ message: "Project assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign project", error: error.message });
  }
};

const changeUserPassword = async (req, res) => {
  const { userId } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateUserPasswordById(Number(userId), hashedPassword);
    res.status(200).json({ message: "User password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user password", error: error.message });
  }
};


const createManagedUser = async (req,res) => {
  const {full_name,email,password,role='user',position_id,is_active=1}=req.body;
  if(!full_name||!email||!password||!position_id)return res.status(400).json({message:'Name, email, password and position are required'});
  if(password.length<6)return res.status(400).json({message:'Password must be at least 6 characters'});
  try{if(await User.findByEmail(email))return res.status(409).json({message:'Email already exists'});const result=await User.createUser(full_name,email,password,{role,position_id});await User.assignUserPosition(result.insertId,Number(position_id),req.user.id);if(!is_active)await User.updateManagedUser(result.insertId,{full_name,email,role,position_id,is_active:0});res.status(201).json({message:'User created successfully'});}catch(error){res.status(500).json({message:'Failed to create user',error:error.message});}
};
const updateManagedUser = async (req,res) => {
  const id=Number(req.params.userId),{full_name,email,password,role='user',position_id,is_active=1}=req.body;
  if(!full_name||!email||!position_id)return res.status(400).json({message:'Name, email and position are required'});
  if(password&&password.length<6)return res.status(400).json({message:'Password must be at least 6 characters'});
  try{const existing=await User.findByEmail(email);if(existing&&Number(existing.id)!==id)return res.status(409).json({message:'Email already exists'});const hashed=password?await bcrypt.hash(password,10):null;await User.updateManagedUser(id,{full_name,email,role,position_id:Number(position_id),is_active:Boolean(is_active),password:hashed});await User.assignUserPosition(id,Number(position_id),req.user.id);res.json({message:'User updated successfully'});}catch(error){res.status(500).json({message:'Failed to update user',error:error.message});}
};
const deleteManagedUser = async (req,res) => {
  const id=Number(req.params.userId);if(id===Number(req.user.id))return res.status(400).json({message:'You cannot delete your own account'});
  try{const target=await User.findById(id);if(!target)return res.status(404).json({message:'User not found'});if(target.role==='super_admin')return res.status(400).json({message:'Super Admin cannot be deleted'});await User.deleteManagedUser(id);res.json({message:'User deleted successfully'});}catch(error){res.status(500).json({message:'Failed to delete user. Remove linked project records first.',error:error.message});}
};
const getPositionPermissionMatrix = async (req,res) => {
  try { res.json({ data: await User.getPositionPermissionMatrix(Number(req.params.positionId)) }); }
  catch(error){ res.status(500).json({message:'Failed to load position permissions',error:error.message}); }
};
const savePositionPermissionMatrix = async (req,res) => {
  if(!Array.isArray(req.body)) return res.status(400).json({message:'Permission array is required'});
  try { await User.savePositionPermissionMatrix(Number(req.params.positionId),req.body);res.json({message:'Position permissions saved successfully'}); }
  catch(error){ res.status(500).json({message:'Failed to save position permissions',error:error.message}); }
};
const getUserPermissionMatrix = async (req,res) => {
  try { const rows=await User.getUserPermissionMatrix(Number(req.params.userId));if(!rows.length)return res.status(404).json({message:'User not found'});res.json({user:{id:rows[0].user_id,full_name:rows[0].full_name,email:rows[0].email,role:rows[0].role,position_id:rows[0].position_id,position_name:rows[0].position_name},data:rows}); }
  catch(error){ res.status(500).json({message:'Failed to load user permissions',error:error.message}); }
};
const saveUserPermissionMatrix = async (req,res) => {
  if(!Array.isArray(req.body)) return res.status(400).json({message:'Permission array is required'});
  try { await User.saveUserPermissionMatrix(Number(req.params.userId),req.body,req.user.id);res.json({message:'User permissions saved successfully'}); }
  catch(error){ res.status(500).json({message:'Failed to save user permissions',error:error.message}); }
};
const resetUserPermissionMatrix = async (req,res) => {
  try { await User.resetUserPermissions(Number(req.params.userId));res.json({message:'User overrides removed; position permissions now apply'}); }
  catch(error){ res.status(500).json({message:'Failed to reset user permissions',error:error.message}); }
};
module.exports = {
  getUserProfile,
  getUserById,
  getAllUsers,
  getUsers,
  getUserManagementDetails,
  updateUserPosition,
  updateUserPermissions,
  assignUserProject,
  changeUserPassword,
  createResource,
  updateResource,
  deleteResource,
  createPosition,
  updatePosition,
  deletePosition,
  createManagedUser, updateManagedUser, deleteManagedUser,
  getPositionPermissionMatrix, savePositionPermissionMatrix, getUserPermissionMatrix, saveUserPermissionMatrix, resetUserPermissionMatrix,
};



