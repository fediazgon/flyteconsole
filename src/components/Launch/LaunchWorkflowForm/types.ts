import { FetchableData, MultiFetchableState } from 'components/hooks';
import { Core } from 'flyteidl';
import {
    LaunchPlan,
    NamedEntityIdentifier,
    WorkflowExecutionIdentifier,
    WorkflowId
} from 'models';
import { SearchableSelectorOption } from './SearchableSelector';

export interface LaunchWorkflowFormProps {
    workflowId: NamedEntityIdentifier;
    onClose(): void;
}

export interface LaunchWorkflowFormInputsRef {
    getValues(): Record<string, Core.ILiteral>;
    validate(): boolean;
}

export interface LaunchWorkflowFormState {
    /** Used to key inputs component so it is re-mounted when we change
     * workflows or launch plans.
     */
    formKey?: string;
    formInputsRef: React.RefObject<LaunchWorkflowFormInputsRef>;
    inputLoadingState: MultiFetchableState;
    inputs: ParsedInput[];
    launchPlanOptionsLoadingState: MultiFetchableState;
    launchPlanSelectorOptions: SearchableSelectorOption<LaunchPlan>[];
    selectedLaunchPlan?: SearchableSelectorOption<LaunchPlan>;
    submissionState: FetchableData<WorkflowExecutionIdentifier>;
    selectedWorkflow?: SearchableSelectorOption<WorkflowId>;
    workflowName: string;
    workflowOptionsLoadingState: MultiFetchableState;
    workflowSelectorOptions: SearchableSelectorOption<WorkflowId>[];
    onCancel(): void;
    onSelectWorkflow(selected: SearchableSelectorOption<WorkflowId>): void;
    onSubmit(): void;
    onSelectLaunchPlan(selected: SearchableSelectorOption<LaunchPlan>): void;
}

export enum InputType {
    Binary = 'BINARY',
    Blob = 'BLOB',
    Boolean = 'BOOLEAN',
    Collection = 'COLLECTION',
    Datetime = 'DATETIME',
    Duration = 'DURATION',
    Error = 'ERROR',
    Float = 'FLOAT',
    Integer = 'INTEGER',
    Map = 'MAP',
    None = 'NONE',
    Schema = 'SCHEMA',
    String = 'STRING',
    Struct = 'STRUCT',
    Unknown = 'UNKNOWN'
}

export interface InputTypeDefinition {
    type: InputType;
    subtype?: InputTypeDefinition;
}

export type InputValue = string | number | boolean | Date;
export type InputChangeHandler = (newValue: InputValue) => void;

export interface InputProps {
    description: string;
    error?: string;
    helperText?: string;
    name: string;
    label: string;
    required: boolean;
    typeDefinition: InputTypeDefinition;
    value?: InputValue;
    onChange: InputChangeHandler;
}

export type ParsedInput = Pick<
    InputProps,
    'description' | 'label' | 'name' | 'required' | 'typeDefinition'
>;
