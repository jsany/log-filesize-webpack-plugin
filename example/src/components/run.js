import chalk from 'chalk'
import {generateRandom} from '../utils/index'

function run(){
  console.log(chalk.green('I am run'),generateRandom(10))
}

export default run
