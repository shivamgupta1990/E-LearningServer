import { Course } from "../models/course.js";
import {deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import {Lecture} from "../models/lecture.js";

export const createCourse=async(req,res)=>{
    try{
        const {courseTitle,category}=req.body;

        if(!courseTitle || !category){
            return res.status(400).json({
                success:false,
                message:"Course title and category are required."
            })
        }

        const course =await Course.create({
            courseTitle,
            category,
            creator:req.id
        });
        return res.status(201).json({
            success:true,
            message:"Course Created",
            course,
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
        })
    }
}

export const searchCourse = async (req, res) => {
    try {
        const { query = "", categories = [], sortByPrice = "" } = req.query;

        const escapedQuery = escapeRegExp(query);

        const searchCriteria = {
            isPublished: true,
            $or: [
                { courseTitle: { $regex: escapedQuery, $options: "i" } },
                { subTitle: { $regex: escapedQuery, $options: "i" } },
                { category: { $regex: escapedQuery, $options: "i" } }
            ]
        };

        // If categories selected
        if (categories.length > 0) {
            searchCriteria.category = { $in: categories };
        }

        // Define sorting order
        const sortOptions = {};
        if (sortByPrice === "low") {
            sortOptions.coursePrice = -1;
        } else if (sortByPrice === "high") {
            sortOptions.coursePrice = 1;
        }

        const courses = await Course.find(searchCriteria)
            .populate({ path: "creator", select: "name photoUrl" })
            .sort(sortOptions);

        return res.status(200).json({
            success: true,
            courses: courses || []
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// helper function
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


export const getPublishedCourse =async(req,res)=>{
    try{
        const courses=await Course.find({isPublished:true}).populate({path:"creator",select:"name photoUrl"});
        if(!courses){
            return res.status(404).json({
                success:true,
                message:"Courses not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Courses found",
            courses
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to get published courses",
        })
    }
}

export const getCreatorCourses =async(req,res)=>{
    try{
        const userId=req.id;
        const courses=await Course.find({creator:userId});
        if(!courses){
            return res.status(404).json({
                success:false,
                message:"Course not found",
                course:[],
            })
        };
        return res.status(200).json({
            success:true,
            message:"Courses fetched",
            courses,
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
        })
    }
}

export const editCourse=async(req,res)=>{
    try{
        const courseId=req.params.courseId;
        const {courseTitle,subTitle,description, category, courseLevel, coursePrice}=req.body;
        const thumbnail= req.file;

        let course=await Course.findById(courseId);
        if(!courseId){
            return res.status(400).json({
                success:false,
                messsage:"Course not found",
            })
        }
        let courseThumbnail;
        if(thumbnail){
            if(course.courseThumbnail){
                const publicId=course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId); //delete old image
            }
            courseThumbnail=await uploadMedia(thumbnail.path);
        }
        const updateData={courseTitle,subTitle,description, category, courseLevel, coursePrice, courseThumbnail:courseThumbnail?.secure_url};

        course=await Course.findByIdAndUpdate(courseId,updateData, {new:true});

        return res.status(200).json({
            success:true,
            message:"Course updated successfully",
            course
        })

    }catch(err){
        console.log(err);
            return res.status(500).json({
            success:false,
            message:"Failed to create course",
        })
    }

}

export const getCourseById =async(req,res)=>{
    try{
        const courseId=req.params.courseId;
        console.log("CourseId->",courseId);
        const course=await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                success:false,
                message:"Course not found",
            })
        }
        console.log("course->",course);
        return res.status(200).json({
            success:true,
            course
        })
    }catch(err){
        console.log(err);
            return res.status(500).json({
            success:false,
            message:"Failed to get course id",
        })
    }
}

export const createLecture=async(req,res)=>{
    try{
        const lectureTitle=req.body?.lectureTitle;
        const {courseId}=req.params;
        if(!lectureTitle || !courseId){
            return res.status(400).json({
                success:false,
                message:"Lecture title is required",
            })
        }
        const lecture=await Lecture.create({lectureTitle});
        const course=await Course.findById(courseId);

        if(course){
            course.lectures.push(lecture._id);
            await course.save();
        }
        return res.status(200).json({
            success:true,
            message:"Lecture created successfully",
            lecture
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to create lecture",
        })
    }
}

export const getCourseLecture=async(req,res)=>{
    try{
        const {courseId}=req.params;
        const course=await Course.findById(courseId).populate("lectures");

        if(!course){
            return res.status(404).json({
                success:false,
                message:"Course not found",
            })
        } 
        return res.status(200).json({
            success:true,
            lectures:course.lectures,
        })  
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to create lecture",
        })
    }
}

export const editLecture=async(req,res)=>{
    try{
        const {lectureTitle ,videoInfo, isPreviewFree}=req.body;
        const {courseId,lectureId}=req.params;
        const lecture=await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                success:false,
                messae:"Lecture not found!"
            })
        }
        //updae Lecture
        if(lectureTitle){
            lecture.lectureTitle=lectureTitle;
        }
        if(videoInfo?.videoUrl){
            lecture.videoUrl=videoInfo.videoUrl;
        }
        if(videoInfo?.publicId){
            lecture.publicId=videoInfo.publicId;
        }
        lecture.isPreviewFree=isPreviewFree;
        await lecture.save();
        //ensure course still has the lecture id
        const course=await Course.findById(courseId);
        if(course && !course.lectures.includes(lecture._id)){
            course.lectures.push(lecture._id);
            await course.save();
        }
        return res.status(200).json({
            success:true,
            message:"Lecture updated successfully."
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to edit lecture",
        })
    }
}

export const removeLecture = async(req,res)=>{
    try{
        const {lectureId}=req.params;
        const lecture =await Lecture.findByIdAndDelete(lectureId);
        if(!lecture){
            return res.status(404).json({
                success:false,
                message:"Lecture not found",
            });
        }

        //delete the lecture from cloudinaary as well
        if(lecture.publicId){
            await deleteVideoFromCloudinary(lecture.publicId);
        }
        //remove lecture from course
        await Course.updateOne({lectures:lectureId},  //find
            {$pull:{lectures:lectureId}}           //remove
        );
        return res.status(200).json({
            success:true,
            message:"Lecture removed successfully."
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to remove lecture",
        })
    }
}

export const getLectureById=async(req,res)=>{
    try{
        const {lectureId}=req.params;
        const lecture =await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                success:false,
                message:"Lecture not found",
            });
        }
        console.log("lecture--->",lecture);
        return res.status(200).json({
            success:true,
            message:"Lecture get successfully",
            lecture
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to get lecture",
        })
    }
}

//publish /unpublish course

export const togglePublishCourse=async(req,res)=>{
    try{
        const {courseId}=req.params;
        const {publish}=req.query;
        const course=await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                success:false,
                message:"Course not found!"
            });
        }
        //publish status based on the query parameter
        course.isPublished = publish ==="true";
        await course.save();
        const statusMessage=course.isPublished ? "Published":"UnPublished";
        return res.status(200).json({
            success:true,
            message:`Course ${statusMessage}`
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to update status",
        })
    }
}