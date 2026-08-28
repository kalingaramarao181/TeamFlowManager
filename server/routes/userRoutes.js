const express = require('express');
const {
  getAllUsers,
  getUserById,
  getUsers,
  getUserManagementDetails,
  createResource,
  updateResource,
  deleteResource,
  createPosition,
  updatePosition,
  deletePosition,
  updateUserPosition,
  updateUserPermissions,
  assignUserProject,
  changeUserPassword,
  createManagedUser, updateManagedUser, deleteManagedUser,
  getPositionPermissionMatrix, savePositionPermissionMatrix, getUserPermissionMatrix, saveUserPermissionMatrix, resetUserPermissionMatrix,
} = require("../controllers/userControllers");
const { protect, authorizeResource } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/users', protect, authorizeResource('users'), getAllUsers);
router.get('/users/all', protect, authorizeResource('users'), getUsers);
router.get('/users/admin-management', protect, authorizeResource('users'), getUserManagementDetails);
router.post('/users/manage', protect, authorizeResource('users','can_create'), createManagedUser);
router.put('/users/:userId/manage', protect, authorizeResource('users','can_edit'), updateManagedUser);
router.delete('/users/:userId/manage', protect, authorizeResource('users','can_delete'), deleteManagedUser);
router.get('/user/:userId', protect, getUserById);
router.post('/resources', protect, authorizeResource('resources','can_create'), createResource);
router.patch('/resources/:resourceId', protect, authorizeResource('resources','can_edit'), updateResource);
router.delete('/resources/:resourceId', protect, authorizeResource('resources','can_delete'), deleteResource);
router.post('/positions', protect, authorizeResource('positions','can_create'), createPosition);
router.patch('/positions/:positionId', protect, authorizeResource('positions','can_edit'), updatePosition);
router.delete('/positions/:positionId', protect, authorizeResource('positions','can_delete'), deletePosition);
router.patch('/users/:userId/position', protect, authorizeResource('users','can_assign'), updateUserPosition);
router.patch('/users/:userId/permissions', protect, authorizeResource('users','can_edit'), updateUserPermissions);
router.patch('/users/:userId/project-assignment', protect, authorizeResource('project_assignment','can_assign'), assignUserProject);
router.patch('/users/:userId/password', protect, authorizeResource('users','can_edit'), changeUserPassword);

router.get('/positions/:positionId/permissions', protect, authorizeResource('positions'), getPositionPermissionMatrix);
router.put('/positions/:positionId/permissions', protect, authorizeResource('positions','can_edit'), savePositionPermissionMatrix);
router.get('/users/:userId/permission-matrix', protect, authorizeResource('users'), getUserPermissionMatrix);
router.put('/users/:userId/permission-matrix', protect, authorizeResource('users','can_edit'), saveUserPermissionMatrix);
router.delete('/users/:userId/permission-matrix', protect, authorizeResource('users','can_delete'), resetUserPermissionMatrix);
module.exports = router;




