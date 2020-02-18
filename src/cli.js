import arg from 'arg';
import inquirer from 'inquirer';

function parseArguments(rawArgs) {
  const args = arg(
    {
      // Types
      '--dump': Boolean,      // If set, responses are echoed as received rather than a readable output
      '--host': String,       // Change the API host URL (Default is "https://api.twitch.tv/")
      '--client-id': String,  // Explicitly specify a Client ID when calling "authorize" to skip prompt. 
      '--token-type': String, // Explicitly specify the token type when calling "authorize" to skip prompt.
      '--method': String,     // The HTTP method (GET (default), POST, PUT, DELETE, PATCH, HEAD, CONNECT, OPTIONS, TRACE)

      // Aliases
      '-d': '--dump',
      '-H': '--host',
      '-c': '--client-id',
      '-t': '--token-type',
      '-X': '--method',
      
      // Commands
      //   accounts (give option to set default with list question like templates)
      //   authorize (client-id, app/user question)
      //   alias (url required)
    },
    {
      argv: rawArgs.slice(2),
    }
  );

  return {
    dump: args['--dump'] || false,
    command: args._[0],
    host: args['--host'] || "https://api.twitch.tv/",
    client_id: args['--client-id'] || "",
    token_type: args['--token-type'] || "",
    method: args['--method'] || "GET",
  };
}

async function promptForMissingOptions(options) {
  const questions = [];

  switch(options.command) {
    case "accounts":
      // No further argument requirements
      break;

    case "authorize":
      // Requires the client-id
      if (options.client_id === "") {
        questions.push({
          type: 'input',
          name: 'client_id',
          message: 'Enter the Client ID of an application to authorize:',
          validate: function (input) {
            //return (input !== '');
            return (input === '')?"Client ID must not be blank.":true;
          },
        });
      }

      // Requires what type of token to create
      if (options.token_type === "" || (options.token_type !== "app" && options.token_type !== "user")) {
        questions.push({
          type: 'list',
          name: 'token_type',
          message: 'What type of token should be created?:',
          choices: [
          {name:'Application Access Token', value:'app'}, 
          {name:'User Access Token', value:'user'},
          ],
        });
      }
      break;

    case "alias":
      // The API URL is required to create an alias
      // if (args._[1]) {
      //  questions.push({
      //    type: 'input',
      //    name: 'API URL',
      //    message: 'What API URL do you want to create an alias for?: ',
      //    default: false,
      //  });
      //   }
      break;  
    default:
      // Assume the command is the API URL
  }

  const answers = await inquirer.prompt(questions);

  return {
    ...options,
    client_id: options.client_id || answers.client_id,
    token_type: options.token_type || answers.token_type,
  };
}

export async function cli(args) {
  let options = parseArguments(args);
  options = await promptForMissingOptions(options);
  console.log(options);
}