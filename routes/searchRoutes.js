const express = require("express");
var fs = require("fs");
var path = require("path");
const pdf = require("pdf-parse");

const router = express.Router();
const util = require("util");

const readdir = util.promisify(fs.readdir);

async function processResumes(keywordsSearched, basePath, allResumes) {
	var selectedResumes = [];
	var keywords = keywordsSearched.split(/[\s,]+/);

	console.log(keywords);

	for (var i = 0; i < allResumes.length; i++) {
		let dataBuffer = fs.readFileSync(basePath + "\\" + allResumes[i]);
		await pdf(dataBuffer).then(function (data) {
			if (keywords.some((keyword) => data.text.toLowerCase().includes(keyword.toLowerCase()))) {
				// rawData.push(data.text);
				selectedResumes.push(allResumes[i]);
			}
		});
	}

	return selectedResumes;
}

router.post("/", async (req, res) => {
	const { keywordsSearched } = req.body;

	if (!keywordsSearched || keywordsSearched === "") {
		res.status(200).json({ text: "No Keyword Recieved" });
	}

	var allResumesPath = path.resolve("public\\resume");
	var allResumes = await readdir(allResumesPath);

	var selectedResumes = await processResumes(
		keywordsSearched,
		allResumesPath,
		allResumes
	);

	// console.log(selectedResumes)
	// console.log(rawData)

	res.status(200).json({ selectedResumes });
});

router.get("/resume/:file", (req, res) => {
	const address = path.join(__dirname, `../public/resume/${req.params.file}`);
	fs.access(address, fs.F_OK, (err) => {
		if (err) {
			res.status(404).json({
				message: "File not found",
			});
			return;
		}
		res.sendFile(address);
	});
});

module.exports = router;
