import fs from 'fs';
import path from 'path';
import multer from 'multer';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import Project from '../../../models/projectModel.js';
import sanitizeFilename from '../../../utils/sanitizeFileName.js';

const allowedFileTypes = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv'
];
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationDir = path.join('public', 'project', req.params.id);

    fs.mkdir(destinationDir, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating directory:', err);
        cb(err, null);
      } else {
        cb(null, destinationDir);
      }
    });
  },
  filename: function (req, file, cb) {
    const originalFilename = file.originalname;
    const sanitizedFilename = sanitizeFilename(originalFilename);
    const fileNameWithoutExtension = path.parse(sanitizedFilename).name;
    const ext = file.mimetype.split('/')[1];
    cb(null, `project-${fileNameWithoutExtension}-${Date.now()}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new AppError('Unsupported file type', 400)); // Reject the file
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const uploadFile = upload.single('file');

const saveFileToDB = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded.', 400));
  }
  const project = await Project.findById(req.params.id);
  if (!project) return next(new AppError('Project not found!', 404));
  const originalFilename = req.file.originalname;
  const sanitizedFilename = sanitizeFilename(originalFilename);
  const fileNameWithoutExtension = path.parse(sanitizedFilename).name;
  const ext = req.file.mimetype.split('/')[1];
  const fileName = `project-${fileNameWithoutExtension}-${Date.now()}.${ext}`;
  project.files.push(fileName);
  project.save();
  res.status(200).json({
    status: 'success',
    message: 'File was successfully uploaded.'
  });
});

export { uploadFile, saveFileToDB };
