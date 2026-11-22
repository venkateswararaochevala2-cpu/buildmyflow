import { NodeTypes } from '@xyflow/react';
import {
  TextNode,
  HeadingNode,
  ImageNode,
  VideoNode,
  AudioNode,
  FileNode,
  DividerNode,
} from './ContentNodes';
import {
  TextMessageNode,
  ImageTextNode,
  VideoTextNode,
  TextButtonNode,
  ImageTextButtonNode,
  MultipleButtonsNode,
  ListMessageNode,
  CardMessageNode,
  CarouselMessageNode,
  DocumentTextNode,
} from './MessageNodes';
import {
  ButtonNode,
  UserInputNode,
  MultipleChoiceNode,
  SingleChoiceNode,
  FormNode,
  LinkNode,
  QuestionNode,
  ContactInfoNode,
  DateSelectionNode,
  RatingNode,
  ConfirmationNode,
} from './InteractiveNodes';
import {
  ConditionNode,
  IfElseNode,
  SwitchNode,
  VariableNode,
  CalculationNode,
  MergeNode,
} from './LogicNodes';
import {
  StartNode,
  EndNode,
  NavigationNode,
  ConnectFlowNode,
  DelayNode,
  RedirectNode,
  SubflowNode,
} from './FlowNodes';
import {
  ApiRequestNode,
  WebhookNode,
  JavaScriptNode,
} from './IntegrationNodes';

export const customNodeTypes: NodeTypes = {
  // Category A: Basic Content
  start: StartNode,
  end: EndNode,
  text: TextNode,
  heading: HeadingNode,
  image: ImageNode,
  video: VideoNode,
  audio: AudioNode,
  file: FileNode,
  divider: DividerNode,

  // Category B: Message Blocks
  textMessage: TextMessageNode,
  imageText: ImageTextNode,
  videoText: VideoTextNode,
  textButton: TextButtonNode,
  imageTextButton: ImageTextButtonNode,
  multipleButtons: MultipleButtonsNode,
  listMessage: ListMessageNode,
  cardMessage: CardMessageNode,
  carouselMessage: CarouselMessageNode,
  documentText: DocumentTextNode,

  // Category C: Interactive Blocks
  singleChoice: SingleChoiceNode,
  multipleChoice: MultipleChoiceNode,
  question: QuestionNode,
  userInput: UserInputNode,
  form: FormNode,
  contactInfo: ContactInfoNode,
  dateSelection: DateSelectionNode,
  rating: RatingNode,
  confirmation: ConfirmationNode,

  // Category D: Flow Blocks
  navigation: NavigationNode,
  connectFlow: ConnectFlowNode,

  // Legacy / Backwards Compatibility Types
  button: ButtonNode,
  link: LinkNode,
  condition: ConditionNode,
  ifElse: IfElseNode,
  switch: SwitchNode,
  variable: VariableNode,
  calculation: CalculationNode,
  merge: MergeNode,
  delay: DelayNode,
  redirect: RedirectNode,
  subflow: SubflowNode,
  apiRequest: ApiRequestNode,
  webhook: WebhookNode,
  javaScript: JavaScriptNode,
};
