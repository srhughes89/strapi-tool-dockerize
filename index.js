#!/usr/bin/env node

/**
 * strapi-tool-strapi-tool-dockerize
 * Add docker support for a Strapi Project
 *
 * @author Simen Daehlin <https://dehlin.dev>
 */

const { cli, init, log, quickStart, reset } = require(`./cli`);
const questions = require(`./core/questions`);
const {
	detectProjectType,
	detectPackageManager,
	detectStrapiProject,
	goodbye,
	detectDownloadsAndStars,
	config,
	createStrapiProject,
	detectDockerFiles
} = require(`./utils`);
const {
	appendEnv,
	createEnv,
	installDependecies,
	createDockerComposeFiles,
	createDockerFiles
} = require(`./core`);
const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;
const path = require(`path`);
const { setConfig } = require(`./utils/config`);
const process = require(`process`);

(async () => {
	init({ clear });
	input.includes(`help`) && cli.showHelp(0);
	debug && log(flags);

	const useQuickStart = input.includes(`new`) ? quickStart(flags) : false;
	try {
		await detectDownloadsAndStars();
		await detectProjectType();
		await detectPackageManager();
		if (!(await detectStrapiProject())) {
			const projectPath = await createStrapiProject();
			process.chdir(projectPath);
			setConfig({ outDir: path.join(process.cwd()) });
		}

		if (input.includes(`reset`)) {
			await reset();
			goodbye();
			return;
		}
		const askQuestions = useQuickStart ? false : await questions();
		if (askQuestions || config.dockerCompose) {
			await detectDockerFiles();
			await createDockerComposeFiles();
			await appendEnv();
			await createEnv();
			await installDependecies();
		}
		await detectDockerFiles();
		await createDockerFiles();
		goodbye();
	} catch (error) {
		goodbye(false);
	}
})();
