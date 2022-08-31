const AWS = require("aws-sdk");
const express = require("express");
const busboy = require("connect-busboy");
const { v4: uuidv4 } = require("uuid");
const { retry } = require("./utils");

const bucketName = "safer-upload";
const tableName = "safer-results";

AWS.config.update({ region: "us-west-2" });

AWS.config.getCredentials(function (err) {
  if (err) console.log(err.stack);
  else {
    console.log("Access key: ", AWS.config.credentials.accessKeyId);
    console.log("Region: ", AWS.config.region);
  }
});

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const db = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

const fetchDetectionResult = async (key) => {
  const result = await db
    .getItem({
      TableName: tableName,
      Key: { id: { S: key } },
      ProjectionExpression: "id,isMatched,signature",
    })
    .promise();
  if (!result || !result.Item) throw new Error("Result not found");

  return AWS.DynamoDB.Converter.unmarshall(result.Item);
};

const waitForDetectionResult = async ({ key, notify }) => {
  try {
    return await retry(() => fetchDetectionResult(key), 60, 1000);
  } catch (e) {
    console.log(e.message);
    throw new Error("Detection result timeout error");
  }
};

const app = express();

app.use(
  busboy({
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  })
);

app.route("/health").get((req, res) => {
  res.send("OK");
});

app.route("/upload").post(function (req, res, next) {
  if (!req.busboy) {
    return res.status(400).send("invalid request");
  }
  req.pipe(req.busboy);
  req.busboy.on("file", async (fieldName, file, { filename, mimeType }) => {
    console.log("Uploading: ", filename, mimeType);
    // todo implement file size limit
    // file.on('limit', function() {
    //   res.writeHead(413, { 'Connection': 'close' });
    //   res.end();
    // });

    const s3Key = uuidv4();
    const s3Params = {
      Bucket: bucketName,
      Key: s3Key,
    };
    const uploadParams = {
      ...s3Params,
      Body: file,
      Metadata: { filename },
      ContentType: mimeType,
    };

    try {
      const data = await s3.upload(uploadParams).promise();
      console.log("Upload success:", data.Location);

      const result = await waitForDetectionResult({ key: uploadParams.Key });
      console.log("Detection result:", result);

      await s3.deleteObject(s3Params).promise();
      console.log("Delete success");

      return res.send(result);
    } catch (e) {
      console.log("Error", e);
      return res.send({ error: e.message });
    }
  });
  req.busboy.on("field", () => {
    return res.status(400).send("invalid form data");
  });
});

const server = app.listen(6000, function () {
  console.log("Listening on port %d", server.address().port);
});
