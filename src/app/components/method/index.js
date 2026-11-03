// Building blocks for method pages. See METHODS_IMPLEMENTATION_PLAN.md, step A3.
//
// <MethodPage>
//   <MethodHeader badge="UNIT 1 • FINDING ROOTS OF EQUATIONS" title="Newton-Raphson" subtitle="Tangent Line Method">
//     One plain sentence saying what the method does.
//   </MethodHeader>
//   <FormulaBox label="HOW IT WORKS" tag="QUADRATIC CONVERGENCE">
//     <Formula math="x_{n+1} = ..." />
//     <FormulaSteps steps={[{ title, text }, ...]} />
//   </FormulaBox>
//   <WorkedExample>
//     <ExampleProblem>…</ExampleProblem>
//     <ExampleStep n={1} title="…"><StepText>…</StepText><MathPanel>…</MathPanel></ExampleStep>
//     <ExampleStep n={2} title="…"><StepTable columns={…} rows={…} /></ExampleStep>
//     <Conclusion result="…" math={…}>…</Conclusion>
//   </WorkedExample>
//   <Lab heading="…"><TheCalculator /></Lab>
//   <Faq items={[{ q, a }]} /> <RelatedMethods ids={[…]} /> <UsedIn courses={[…]} /> <OpenInNotes />
// </MethodPage>

export { MethodPage, MethodHeader, Lab } from './MethodPage';
export { FormulaBox, Formula, FormulaSteps } from './FormulaBox';
export { WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, IterationPanel, Conclusion } from './WorkedExample';
export { StepTable } from './StepTable';
export { Faq, RelatedMethods, UsedIn, OpenInNotes } from './PageExtras';
// Matrix input/display ('use client'); import from '@/app/components/method/Matrix' directly in calculators
