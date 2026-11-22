import { Node, Edge, Viewport } from '@xyflow/react';

export type BlockCategory = 'message' | 'interactive' | 'content' | 'flow' | 'logic' | 'integration';

export type NodeType =
  // Category A: Basic Content
  | 'start'
  | 'end'
  | 'text'
  | 'heading'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'divider'
  // Category B: Message Blocks
  | 'textMessage'
  | 'imageText'
  | 'videoText'
  | 'textButton'
  | 'imageTextButton'
  | 'multipleButtons'
  | 'listMessage'
  | 'cardMessage'
  | 'carouselMessage'
  | 'documentText'
  // Category C: Interactive Blocks
  | 'singleChoice'
  | 'multipleChoice'
  | 'question'
  | 'userInput'
  | 'form'
  | 'contactInfo'
  | 'dateSelection'
  | 'rating'
  | 'confirmation'
  // Category D: Flow Blocks
  | 'navigation'
  | 'connectFlow'
  // Legacy / Compatibility Types (preserved for migration)
  | 'button'
  | 'link'
  | 'condition'
  | 'ifElse'
  | 'switch'
  | 'variable'
  | 'calculation'
  | 'merge'
  | 'delay'
  | 'redirect'
  | 'subflow'
  | 'apiRequest'
  | 'webhook'
  | 'javaScript';

export interface BaseNodeData {
  label: string;
  type: NodeType;
  description?: string;
  [key: string]: unknown;
}

// Common Button model for conversational flows
export interface FlowButton {
  id: string;
  text: string;
  style?: 'primary' | 'secondary' | 'outline';
  actionType?: 'navigate' | 'url';
  url?: string;
}

export type MessageButton = FlowButton;
export type ButtonItem = FlowButton;

// --- Category A: Basic Content Node Data ---

export interface StartNodeData extends BaseNodeData {
  type: 'start';
}

export interface EndNodeData extends BaseNodeData {
  type: 'end';
  endMessage?: string;
}

export interface TextNodeData extends BaseNodeData {
  type: 'text';
  headerText?: string;
  content: string;
  footerText?: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  fontWeight?: 'normal' | 'medium' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  backgroundColor?: string;
  maxCharacters?: number;
  buttons?: FlowButton[];
}

export interface HeadingNodeData extends BaseNodeData {
  type: 'heading';
  text: string;
  level: 1 | 2 | 3 | 4;
  fontSize?: 'base' | 'lg' | 'xl' | '2xl';
  fontWeight?: 'medium' | 'semibold' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
}

export interface ImageNodeData extends BaseNodeData {
  type: 'image';
  imageUrl: string;
  assetId?: string; // Stored in IndexedDB
  width?: number | string;
  height?: number | string;
  aspectRatio?: 'auto' | '16/9' | '4/3' | '1/1';
  alignment?: 'left' | 'center' | 'right';
  altText?: string;
}

export interface VideoNodeData extends BaseNodeData {
  type: 'video';
  videoUrl: string;
  width?: number | string;
  height?: number | string;
  controls?: boolean;
  autoplay?: boolean;
}

export interface AudioNodeData extends BaseNodeData {
  type: 'audio';
  audioUrl: string;
  controls?: boolean;
  autoplay?: boolean;
}

export interface FileNodeData extends BaseNodeData {
  type: 'file';
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
}

export interface DividerNodeData extends BaseNodeData {
  type: 'divider';
  spacing?: 'sm' | 'md' | 'lg';
  borderStyle?: 'solid' | 'dashed' | 'dotted';
}

// --- Category B: Message Blocks Node Data ---

export interface TextMessageNodeData extends BaseNodeData {
  type: 'textMessage';
  message: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  backgroundColor?: string;
}

export interface ImageTextNodeData extends BaseNodeData {
  type: 'imageText';
  imageUrl: string;
  assetId?: string;
  imagePosition: 'top' | 'bottom';
  heading?: string;
  text: string;
  caption?: string;
  width?: string;
  height?: string;
}

export interface VideoTextNodeData extends BaseNodeData {
  type: 'videoText';
  videoUrl: string;
  heading?: string;
  text: string;
}

export interface TextButtonNodeData extends BaseNodeData {
  type: 'textButton';
  message: string;
  buttons: FlowButton[];
}

export interface ImageTextButtonNodeData extends BaseNodeData {
  type: 'imageTextButton';
  imageUrl: string;
  assetId?: string;
  heading: string;
  description: string;
  buttons: FlowButton[];
}

export interface MultipleButtonsNodeData extends BaseNodeData {
  type: 'multipleButtons';
  title: string;
  buttons: FlowButton[];
}

export interface ListItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export interface ListMessageNodeData extends BaseNodeData {
  type: 'listMessage';
  title: string;
  description?: string;
  items: ListItem[];
}

export interface CardMessageNodeData extends BaseNodeData {
  type: 'cardMessage';
  imageUrl?: string;
  assetId?: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl?: string;
}

export interface CarouselCard {
  id: string;
  imageUrl?: string;
  title: string;
  description: string;
  buttonText: string;
}

export interface CarouselMessageNodeData extends BaseNodeData {
  type: 'carouselMessage';
  title?: string;
  cards: CarouselCard[];
}

export interface DocumentTextNodeData extends BaseNodeData {
  type: 'documentText';
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
  text: string;
}

// --- Category C: Interactive Blocks Node Data ---

export interface ChoiceOption {
  id: string;
  text: string;
  value: string;
}

export interface SingleChoiceNodeData extends BaseNodeData {
  type: 'singleChoice';
  question: string;
  options: ChoiceOption[];
  defaultSelection?: string;
  required?: boolean;
  variableName?: string;
}

export interface MultipleChoiceNodeData extends BaseNodeData {
  type: 'multipleChoice';
  question: string;
  options: ChoiceOption[];
  variableName?: string;
}

export interface QuestionNodeData extends BaseNodeData {
  type: 'question';
  question: string;
  answerType?: 'text' | 'number' | 'email' | 'phone' | 'date';
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  variableName?: string;
}

export type InputFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'longText';

export interface UserInputNodeData extends BaseNodeData {
  type: 'userInput';
  fieldLabel: string;
  placeholder?: string;
  inputType?: InputFieldType;
  required?: boolean;
  defaultValue?: string;
  variableName?: string;
  validationRegex?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: InputFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  variableName?: string;
}

export interface FormNodeData extends BaseNodeData {
  type: 'form';
  formTitle: string;
  formDescription?: string;
  fields: FormField[];
  submitButtonText?: string;
}

export interface ContactInfoNodeData extends BaseNodeData {
  type: 'contactInfo';
  title: string;
  description?: string;
  requireName: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
  submitButtonText?: string;
}

export interface DateSelectionNodeData extends BaseNodeData {
  type: 'dateSelection';
  label: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
}

export interface RatingNodeData extends BaseNodeData {
  type: 'rating';
  question: string;
  maxRating: 3 | 5 | 10;
  ratingType: 'stars' | 'numbers';
}

export interface ConfirmationNodeData extends BaseNodeData {
  type: 'confirmation';
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

// --- Category D: Flow Blocks Node Data ---

export interface NavigationNodeData extends BaseNodeData {
  type: 'navigation';
  title: string;
  targetUrl: string;
  buttonText: string;
  openInNewTab?: boolean;
}

export interface ConnectFlowNodeData extends BaseNodeData {
  type: 'connectFlow';
  flowName: string;
  flowId?: string;
  description?: string;
}

// --- Legacy / Backwards Compatibility Types ---

export interface ButtonNodeData extends BaseNodeData {
  type: 'button';
  buttonLabel?: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline';
  backgroundColor?: string;
  textColor?: string;
  fullWidth?: boolean;
  actionType?: 'continue' | 'openUrl' | 'triggerEvent';
  targetUrl?: string;
  buttons?: FlowButton[];
}

export interface LinkNodeData extends BaseNodeData {
  type: 'link';
  url: string;
  title: string;
  openInNewTab?: boolean;
}

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'contains'
  | 'doesNotContain'
  | 'isEmpty'
  | 'isNotEmpty';

export interface ConditionNodeData extends BaseNodeData {
  type: 'condition';
  variable?: string;
  operator?: ConditionOperator;
  comparisonValue?: string;
}

export interface IfElseNodeData extends BaseNodeData {
  type: 'ifElse';
  variable?: string;
  operator?: ConditionOperator;
  comparisonValue?: string;
}

export interface SwitchCase {
  id: string;
  label: string;
  value: string;
}

export interface SwitchNodeData extends BaseNodeData {
  type: 'switch';
  variable?: string;
  cases?: SwitchCase[];
}

export interface VariableNodeData extends BaseNodeData {
  type: 'variable';
  variableName?: string;
  dataType?: 'string' | 'number' | 'boolean' | 'json';
  initialValue?: string;
  description?: string;
}

export type MathOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'modulo';

export interface CalculationNodeData extends BaseNodeData {
  type: 'calculation';
  targetVariable?: string;
  firstOperand?: string;
  operator?: MathOperation;
  secondOperand?: string;
}

export interface MergeNodeData extends BaseNodeData {
  type: 'merge';
  description?: string;
}

export interface DelayNodeData extends BaseNodeData {
  type: 'delay';
  duration?: number;
  unit?: 'seconds' | 'minutes' | 'hours' | 'days';
}

export interface RedirectNodeData extends BaseNodeData {
  type: 'redirect';
  targetUrl?: string;
}

export interface SubflowNodeData extends BaseNodeData {
  type: 'subflow';
  subflowId?: string;
  subflowName?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HeaderItem {
  key: string;
  value: string;
}

export interface ApiRequestNodeData extends BaseNodeData {
  type: 'apiRequest';
  method?: HttpMethod;
  url?: string;
  headers?: HeaderItem[];
  queryParams?: HeaderItem[];
  requestBody?: string;
  responseVariable?: string;
}

export interface WebhookNodeData extends BaseNodeData {
  type: 'webhook';
  webhookUrl?: string;
  method?: HttpMethod;
  headers?: HeaderItem[];
  payload?: string;
}

export interface JavaScriptNodeData extends BaseNodeData {
  type: 'javaScript';
  code?: string;
  outputVariable?: string;
}

export type AnyCustomNodeData =
  | StartNodeData
  | EndNodeData
  | TextNodeData
  | HeadingNodeData
  | ImageNodeData
  | VideoNodeData
  | AudioNodeData
  | FileNodeData
  | DividerNodeData
  | TextMessageNodeData
  | ImageTextNodeData
  | VideoTextNodeData
  | TextButtonNodeData
  | ImageTextButtonNodeData
  | MultipleButtonsNodeData
  | ListMessageNodeData
  | CardMessageNodeData
  | CarouselMessageNodeData
  | DocumentTextNodeData
  | SingleChoiceNodeData
  | MultipleChoiceNodeData
  | QuestionNodeData
  | UserInputNodeData
  | FormNodeData
  | ContactInfoNodeData
  | DateSelectionNodeData
  | RatingNodeData
  | ConfirmationNodeData
  | NavigationNodeData
  | ConnectFlowNodeData
  // Legacy types
  | ButtonNodeData
  | LinkNodeData
  | ConditionNodeData
  | IfElseNodeData
  | SwitchNodeData
  | VariableNodeData
  | CalculationNodeData
  | MergeNodeData
  | DelayNodeData
  | RedirectNodeData
  | SubflowNodeData
  | ApiRequestNodeData
  | WebhookNodeData
  | JavaScriptNodeData;

export type FlowNode = Node<AnyCustomNodeData, NodeType>;
export type FlowEdge = Edge;

export type WorkflowCategory =
  | 'General Flow'
  | 'Chatbot'
  | 'Customer Journey'
  | 'Product Flow'
  | 'Form Flow'
  | 'Support Flow'
  | string;

export interface WorkflowMetadata {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowSettings {
  defaultZoom: number;
  snapToGrid: boolean;
  gridSize: number;
  showMinimap: boolean;
  showGrid: boolean;
}

export interface WorkflowData {
  metadata: WorkflowMetadata;
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: Viewport;
  settings: WorkflowSettings;
  schemaVersion: number;
}
