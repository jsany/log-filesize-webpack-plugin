import chalk from 'chalk'
import {generateRandom} from '../utils/index'


function walk(){
  console.log(chalk.green('I am walk'),generateRandom(10))
}

export default walk
