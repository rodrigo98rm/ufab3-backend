import { Express, Router } from "express";
import { upload } from "../../middlewares/upload";
import { uploadXlsx } from "../../controllers/uploadController";

const uploadRouter = Router();

uploadRouter.post("/", upload.single("file"), (req, res) => {
  uploadXlsx(req, res);
});

export default uploadRouter;
