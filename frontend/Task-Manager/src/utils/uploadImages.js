import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
     //APPEND IMAGE FILE TO FORM DATA
     formData.append('image', imageFile);

try {
    const response = await axiosInstance.post (API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
        headers: {
            'Content-Type': 'multiple/form-data', //Set Headers for file upload
        },
    });
    return response.data; //Return Response data

} catch (error) {
    console.log('Error uploading the image', error);
    throw error; // Re Throw error for handling

    } 
};

export default uploadImage;