const { outputFile } = require(`fs-extra`);
const { Liquid } = require(`liquidjs`);
const path = require(`path`);
const {
	yarnLockToPackageLock,
	checkForDataFolder,
	spinner,
	chalk,
	generateError,
	copyFile,
	config
} = require(`../utils`);

const liquidEngine = new Liquid({
	root: path.join(__dirname, `..`, `templates`),
	extname: `.liquid`
});

const createDockerFiles = async () => {
	const prodExtension =
		config.env === `production` || config.env === `both` ? `.prod` : ``;
	const template = liquidEngine.renderFileSync(
		`Dockerfile${prodExtension.replace(`.`, `-`)}`,
		{
			packageManager: config.packageManager
		}
	);
	const filePath = path.join(config.outDir, `Dockerfile${prodExtension}`);
	try {
		await outputFile(filePath, template);
		spinner.stopAndPersist({
			symbol: `🐳`,
			text: ` ${chalk.bold.blue(`Dockerfile`)} for ${chalk.yellow(
				config.env === `both`
					? `development and production`
					: config.env.toUpperCase()
			)} added \n`
		});
	} catch (error) {
		generateError(error);
	}

	await copyFile(
		`${config.dockerfileDir}/.dockerignore`,
		`${config.outDir}/.dockerignore`
	);
	await checkForDataFolder();
};

const createDockerComposeFiles = async () => {
	spinner.start(` 🐳  Creating docker-compose.yml file`);
	const template = liquidEngine.renderFileSync(`docker-compose`, {
		name: config.projectName,
		env: config.env,
		dbtype: config.dbtype,
		dbport: config.dbport
	});
	const filePath = path.join(config.outDir, `docker-compose.yml`);
	await outputFile(filePath, template);
	spinner.stopAndPersist({
		symbol: `🐳`,
		text: ` Added docker-compose file with ${chalk.bold.green(
			config.dbtype.toUpperCase()
		)} configuration \n`
	});
	await yarnLockToPackageLock();
};

module.exports = { createDockerComposeFiles, createDockerFiles };
