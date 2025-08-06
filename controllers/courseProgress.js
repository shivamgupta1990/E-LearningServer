import { Course } from "../models/course.js";
import { CourseProgress } from "../models/courseProgress.js";

export const getCourseProgress = async(req,res)=>{
    try{
        const {courseId}=req.params;
        console.log("courseId->",courseId);
        const userId=req.id;

        //fetch the user course progress
        let courseProgress= await CourseProgress.findOne({courseId,userId}).populate("courseId");

        const courseDetails= await Course.findById(courseId).populate("lectures");

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Course not found"
            })
        }
        //strp-2 if no progress found, return course details with  an empty progress
        if(!courseProgress){
            return res.status(200).json({
                data:{
                    courseDetails,
                    progress:[],
                    complete:false
                }
            })
        }
        //step-3 return the user's course progress along with course details
        return res.status(200).json({
            data:{
                courseDetails,
                progress:courseProgress.lectureProgress,
                complete:courseProgress.completed            }
        })
    }catch(err){
        console.log(err);
    }
}


export const updateLectureProgress =async(req,res)=>{
    try{
        const {courseId,lectureId} = req.params;
        const userId= req.id;
        let courseProgress= await CourseProgress.findOne({courseId,userId});

        console.log(courseProgress)
        if(!courseProgress){
            //if no progress exist, create a new record
            courseProgress= new CourseProgress({
                userId,
                courseId,
                completed:false,
                lectureProgress:[],
            })
        }
        //find the lecture progress in the course progress
        const lectureIndex =courseProgress.lectureProgress.findIndex((lecture)=>lecture.lectureId===lectureId);

        if(lectureIndex !== -1){
            //if lecture already exist, update its status
            courseProgress.lectureProgress[lectureIndex].viewed=true;
        }
        else{
            // Add new lecture progress
            courseProgress.lectureProgress.push({
                lectureId,
                viewed:true
            });
        }
        //if all lecture is completed

        const lectureProgressLength = courseProgress?.lectureProgress.filter((lectureProg)=>lectureProg.viewed).length;

        const course = await Course.findById(courseId);
        if(course.lectures.length === lectureProgressLength){
            courseProgress.completed=true;
        }
        await courseProgress.save();  
        return res.status(200).json({
            success:true,
            message:"Lecture progress updated successfully."
        })
    }catch(err){
        console.log(err);
    }
};


export const markAsCompleted = async(req,res)=>{
    try {
        const {courseId} = req.params;
        const userId = req.id;
        console.log("courseId markAsCompleted->",courseId);
        const courseProgress =  await CourseProgress.findOne({courseId,userId});

        if(!courseProgress){
            return res.status(404).json({
                message:"Course progress not found"
            })
        }
        courseProgress.lectureProgress.map((lectureProgress)=>lectureProgress.viewed=true);
        courseProgress.completed=true;
        await courseProgress.save();
        return res.status(200).json({
            message:"Course marked as completed."
        })
    } catch (error) {
        console.log(error);
    }
}

export const markAsInCompleted = async(req,res)=>{
    try {
        const {courseId} = req.params;
        const userId = req.id;
        console.log("courseId markAsInCompleted->",courseId);
        const courseProgress =  await CourseProgress.findOne({courseId,userId});

        if(!courseProgress){
            return res.status(404).json({
                message:"Course progress not found"
            })
        }
        courseProgress.lectureProgress.map((lectureProgress)=>lectureProgress.viewed=false);
        courseProgress.completed=false;
        await courseProgress.save();
        return res.status(200).json({
            message:"Course marked as incompleted."
        })
    } catch (error) {
        console.log(error);
    }
}

