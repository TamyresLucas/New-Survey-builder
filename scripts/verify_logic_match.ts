
import { customerFeedbackSurvey } from '../data/test-surveys';

const q1 = customerFeedbackSurvey.blocks[0].questions[1];
const choices = q1.choices || [];
const branches = q1.branchingLogic?.branches || [];

console.log('Q1 Choices:', choices.map(c => `"${c.text}"`));

branches.forEach((b, i) => {
    console.log(`Branch ${i} target: ${b.thenSkipTo}`);
    b.conditions.forEach((c, ci) => {
        console.log(`  Condition ${ci} value: "${c.value}"`);
        const match = choices.find(choice => choice.text === c.value);
        console.log(`  Match found? ${!!match}`);
        if (!match) {
            console.log('  MISMATCH! Value versus choices:');
            choices.forEach(ch => {
                console.log(`    "${ch.text}" === "${c.value}" ? ${ch.text === c.value}`);
            });
        }
    });
});
