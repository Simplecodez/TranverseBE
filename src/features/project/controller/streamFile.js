import fs from 'fs';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import AppError from '../../../utils/appError.js';

const streamFile = async (req, res, next) => {
  const projectId = req.params.id;
  const { fileName } = req.query;
  const filePath = path.join(process.cwd(), `/public/project/${projectId}/${fileName}`);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', err);
      return next(new AppError('File not found', 400));
    }

    // Read a portion of the file to determine its MIME type
    const fileStream = fs.createReadStream(filePath, { start: 0, end: 262 }); // Read the first 262 bytes (file-type's minimum buffer size)

    fileStream.once('readable', async () => {
      const chunk = fileStream.read();
      fileStream.destroy(); // Destroy the stream once the chunk is read
      if (!chunk) {
        return next(new AppError('Unable to read file, Please try again', 500));
      }

      // Determine the file's MIME type
      const mimeType = await fileTypeFromBuffer(chunk);
      if (!mimeType) {
        return next(new AppError('Unable to determine file type', 500));
      }

      // Set appropriate headers for streaming
      res.setHeader('Content-Type', mimeType.mime);
      res.setHeader('Content-Disposition', 'inline');

      // Create a readable stream for the file
      const stream = fs.createReadStream(filePath);

      // Pipe the stream to the response
      stream.on('error', (error) => {
        console.error('Error streaming file:', error);
        // Handle the error and call `next` to pass it to the error handling middleware
        return next(new AppError('Internal server error', 500));
      });

      // Pipe the stream to the response
      stream.pipe(res);

      // Listen for the 'end' event of the stream to send the completion message
      //   stream.on('end', () => {
      //     console.log('Stream has ended');
      //     // Send a completion message to the client
      //     res.status(200).json({ status: 'success', message: 'File stream is completed.' });
      //   });
    });
  });
};

export default streamFile;
