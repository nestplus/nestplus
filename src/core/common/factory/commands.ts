import chalk from 'chalk';
import yargs from 'yargs';
import { CommandCollection, CommandParams } from '../types';

/**
 * 利用Yargs构建命令
 *
 * @export
 * @param {CommandParams} params
 * @param {CommandCollection} commands
 */
export function buildCommands(
    params: CommandParams,
    commands: CommandCollection,
) {
    console.log();
    [
        getRunCommand(params),
        ...generateCommands(params, commands),
    ].forEach((command) => yargs.command(command));
    yargs
        .usage('Usage: $0 <command> [options]')
        .scriptName('cli')
        .demandCommand(1, '')
        .fail((msg, err, y) => {
            if (!msg && !err) {
                yargs.showHelp();
                process.exit();
            }
            if (msg) console.error(chalk.red(msg));
            if (err) console.error(chalk.red(err.message));
            process.exit();
        })
        .strict()
        .alias('v', 'version')
        .help('h')
        .alias('h', 'help').argv;
}

/**
 * 生成自定义命令
 *
 * @param {CommandParams} params
 * @param {CommandCollection} commands
 * @return {*}
 */
function generateCommands(params: CommandParams, commands: CommandCollection) {
    const { current, hooks } = params;
    return commands.map((item) => {
        const command = item(params);
        return {
            ...command,
            handler: async (args: yargs.Arguments<any>) => {
                const handler = command.handler as (
                    ...argvs: yargs.Arguments<any>
                ) => Promise<void>;
                await handler({ ...params, ...args });
                await current.close();
                if (hooks?.closed) await hooks.closed(params);
            },
        };
    });
}

/**
 * 监听HTTP命令
 *
 * @param {CommandParams} params
 * @return {*}
 */
function getRunCommand(params: CommandParams) {
    const { configure, current, hooks } = params;
    return {
        command: ['start', '$0'],
        describe: 'Start app',
        builder: {},
        handler: async () => {
            const host = configure.get<boolean>('app.host');
            const port = configure.get<number>('app.port')!;
            const https = configure.get<boolean>('app.https');
            let appUrl = configure.get<string>('app.url');
            if (!appUrl) {
                appUrl = `${https ? 'https' : 'http'}://${host!}:${port}`;
            }
            await current.listen(port, '0.0.0.0', () => {
                console.log();
                console.log('Server has started:');
                hooks?.listend
                    ? hooks.listend(params)
                    : console.log(`- API: ${chalk.green.underline(appUrl!)}`);
            });
        },
    };
}
