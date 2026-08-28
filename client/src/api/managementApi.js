import axios from "./axiosInstance";
export const getManagement=async()=>(await axios.get("/users/admin-management")).data;
export const createResource=async(data)=>(await axios.post("/resources",data)).data;
export const updateResource=async(id,data)=>(await axios.patch(`/resources/${id}`,data)).data;
export const deleteResource=async(id)=>(await axios.delete(`/resources/${id}`)).data;
export const createPosition=async(data)=>(await axios.post("/positions",data)).data;
export const updatePosition=async(id,data)=>(await axios.patch(`/positions/${id}`,data)).data;
export const deletePosition=async(id)=>(await axios.delete(`/positions/${id}`)).data;
export const updateUserPosition=async(id,position_id)=>(await axios.patch(`/users/${id}/position`,{position_id})).data;
export const getPositionMatrix=async(id)=>(await axios.get(`/positions/${id}/permissions`)).data;
export const savePositionMatrix=async(id,data)=>(await axios.put(`/positions/${id}/permissions`,data)).data;
export const getUserMatrix=async(id)=>(await axios.get(`/users/${id}/permission-matrix`)).data;
export const saveUserMatrix=async(id,data)=>(await axios.put(`/users/${id}/permission-matrix`,data)).data;
export const resetUserMatrix=async(id)=>(await axios.delete(`/users/${id}/permission-matrix`)).data;export const createUser=async(data)=>(await axios.post("/users/manage",data)).data;
export const updateUser=async(id,data)=>(await axios.put(`/users/${id}/manage`,data)).data;
export const deleteUser=async(id)=>(await axios.delete(`/users/${id}/manage`)).data;

