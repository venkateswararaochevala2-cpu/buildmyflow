import { WorkflowData, FlowNode, NodeType } from '../types/workflow';
import { ValidationIssue, ValidationReport } from '../types/validation';

export function validateWorkflow(workflow: WorkflowData): ValidationReport {
  const issues: ValidationIssue[] = [];
  const { nodes, edges } = workflow;

  // 1. Start Node validation
  const startNodes = nodes.filter((n) => n.type === 'start');
  if (startNodes.length === 0) {
    issues.push({
      id: 'val_start_missing',
      title: 'Missing Start Block',
      message: 'The workflow must have a Start block to establish where the conversation begins.',
      severity: 'error',
      category: 'structure',
    });
  } else if (startNodes.length > 1) {
    startNodes.slice(1).forEach((node) => {
      issues.push({
        id: `val_start_multiple_${node.id}`,
        nodeId: node.id,
        title: 'Multiple Start Blocks Detected',
        message: 'A flow can only have one starting point. Please delete extra Start blocks.',
        severity: 'error',
        category: 'structure',
      });
    });
  }

  // 2. End Node check
  const endNodes = nodes.filter((n) => n.type === 'end');
  if (nodes.length > 2 && endNodes.length === 0) {
    issues.push({
      id: 'val_end_missing',
      title: 'No End Block',
      message: 'Consider adding an End block to clearly conclude the customer journey.',
      severity: 'warning',
      category: 'structure',
    });
  }

  // Set of connected node IDs
  const connectedNodeIds = new Set<string>();
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  // 3. Disconnected nodes check
  nodes.forEach((node) => {
    if (!connectedNodeIds.has(node.id) && nodes.length > 1) {
      issues.push({
        id: `val_disconnected_${node.id}`,
        nodeId: node.id,
        title: `Disconnected ${node.data.label || node.type}`,
        message: 'This block is not connected to any other part of the flow.',
        severity: 'warning',
        category: 'connectivity',
      });
    }
  });

  // 4. Reachability from Start block
  if (startNodes.length === 1) {
    const reachable = new Set<string>();
    const queue = [startNodes[0].id];
    reachable.add(startNodes[0].id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const outgoing = edges.filter((e) => e.source === current);
      for (const edge of outgoing) {
        if (!reachable.has(edge.target)) {
          reachable.add(edge.target);
          queue.push(edge.target);
        }
      }
    }

    nodes.forEach((node) => {
      if (!reachable.has(node.id) && node.id !== startNodes[0].id && connectedNodeIds.has(node.id)) {
        issues.push({
          id: `val_unreachable_${node.id}`,
          nodeId: node.id,
          title: `Unreachable: ${node.data.label || node.type}`,
          message: 'This block is connected but cannot be reached from the Start block.',
          severity: 'warning',
          category: 'connectivity',
        });
      }
    });
  }

  // 5. Node properties validation
  nodes.forEach((node) => {
    validateNodeProperties(node, issues);
  });

  const errorsCount = issues.filter((i) => i.severity === 'error').length;
  const warningsCount = issues.filter((i) => i.severity === 'warning').length;

  return {
    isValid: errorsCount === 0,
    errorsCount,
    warningsCount,
    issues,
    timestamp: new Date().toISOString(),
  };
}

function validateNodeProperties(node: FlowNode, issues: ValidationIssue[]): void {
  const d = node.data as any;
  const label = d.label || node.type;

  switch (d.type as NodeType) {
    // Basic Content
    case 'text':
      if (!d.content || !String(d.content).trim()) {
        issues.push({
          id: `val_text_empty_${node.id}`,
          nodeId: node.id,
          title: `Empty Text: ${label}`,
          message: 'Please provide message content for this text block.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'heading':
      if (!d.text || !String(d.text).trim()) {
        issues.push({
          id: `val_heading_empty_${node.id}`,
          nodeId: node.id,
          title: `Empty Heading: ${label}`,
          message: 'Please provide heading text.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'image':
      if (!d.imageUrl && !d.assetId) {
        issues.push({
          id: `val_image_missing_${node.id}`,
          nodeId: node.id,
          title: `Missing Image: ${label}`,
          message: 'Please provide an image web URL or upload a file.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'video':
      if (!d.videoUrl || !String(d.videoUrl).trim()) {
        issues.push({
          id: `val_video_missing_${node.id}`,
          nodeId: node.id,
          title: `Missing Video URL: ${label}`,
          message: 'Please enter a video URL.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    // Message Blocks
    case 'textMessage':
      if (!d.message || !String(d.message).trim()) {
        issues.push({
          id: `val_msg_empty_${node.id}`,
          nodeId: node.id,
          title: `Empty Message: ${label}`,
          message: 'Text Message cannot be empty. Please enter your text.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'imageText':
      if (!d.imageUrl && !d.assetId) {
        issues.push({
          id: `val_imgtxt_img_${node.id}`,
          nodeId: node.id,
          title: `Missing Image: ${label}`,
          message: 'Please enter an image URL or upload an image.',
          severity: 'error',
          category: 'property',
        });
      }
      if (!d.text || !String(d.text).trim()) {
        issues.push({
          id: `val_imgtxt_text_${node.id}`,
          nodeId: node.id,
          title: `Missing Text: ${label}`,
          message: 'Please provide description text for this card.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'videoText':
      if (!d.videoUrl || !String(d.videoUrl).trim()) {
        issues.push({
          id: `val_vidtxt_url_${node.id}`,
          nodeId: node.id,
          title: `Missing Video: ${label}`,
          message: 'Please provide a video URL.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'textButton':
      if (!d.message || !String(d.message).trim()) {
        issues.push({
          id: `val_txtbtn_msg_${node.id}`,
          nodeId: node.id,
          title: `Empty Prompt: ${label}`,
          message: 'Please provide message text above the buttons.',
          severity: 'error',
          category: 'property',
        });
      }
      if (!d.buttons || d.buttons.length === 0) {
        issues.push({
          id: `val_txtbtn_empty_${node.id}`,
          nodeId: node.id,
          title: `No Buttons: ${label}`,
          message: 'Please add at least one button to this block.',
          severity: 'error',
          category: 'property',
        });
      } else {
        d.buttons.forEach((btn: any, idx: number) => {
          if (!btn.text || !String(btn.text).trim()) {
            issues.push({
              id: `val_txtbtn_lbl_${node.id}_${idx}`,
              nodeId: node.id,
              title: `Empty Button Label: ${label}`,
              message: `Button #${idx + 1} has an empty label.`,
              severity: 'error',
              category: 'property',
            });
          }
        });
      }
      break;

    case 'imageTextButton':
      if (!d.heading || !String(d.heading).trim()) {
        issues.push({
          id: `val_imgbtn_hd_${node.id}`,
          nodeId: node.id,
          title: `Missing Heading: ${label}`,
          message: 'Card requires a heading title.',
          severity: 'error',
          category: 'property',
        });
      }
      if (!d.buttons || d.buttons.length === 0) {
        issues.push({
          id: `val_imgbtn_btns_${node.id}`,
          nodeId: node.id,
          title: `No Buttons: ${label}`,
          message: 'Add at least one button to this card.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'multipleButtons':
      if (!d.buttons || d.buttons.length === 0) {
        issues.push({
          id: `val_mbtns_empty_${node.id}`,
          nodeId: node.id,
          title: `No Buttons: ${label}`,
          message: 'Multiple Buttons block must contain at least one button.',
          severity: 'error',
          category: 'property',
        });
      } else {
        d.buttons.forEach((btn: any, idx: number) => {
          if (!btn.text || !String(btn.text).trim()) {
            issues.push({
              id: `val_mbtns_btn_${node.id}_${idx}`,
              nodeId: node.id,
              title: `Empty Button #${idx + 1}`,
              message: `Please specify label text for Button #${idx + 1}.`,
              severity: 'error',
              category: 'property',
            });
          }
        });
      }
      break;

    case 'listMessage':
      if (!d.title || !String(d.title).trim()) {
        issues.push({
          id: `val_list_title_${node.id}`,
          nodeId: node.id,
          title: `Missing List Title: ${label}`,
          message: 'List Message requires a title.',
          severity: 'error',
          category: 'property',
        });
      }
      if (!d.items || d.items.length === 0) {
        issues.push({
          id: `val_list_items_${node.id}`,
          nodeId: node.id,
          title: `No List Items: ${label}`,
          message: 'Please add at least one item to this list.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'cardMessage':
      if (!d.heading || !String(d.heading).trim()) {
        issues.push({
          id: `val_card_head_${node.id}`,
          nodeId: node.id,
          title: `Missing Card Heading: ${label}`,
          message: 'Card requires a heading title.',
          severity: 'error',
          category: 'property',
        });
      }
      if (!d.buttonText || !String(d.buttonText).trim()) {
        issues.push({
          id: `val_card_btn_${node.id}`,
          nodeId: node.id,
          title: `Missing Button Label: ${label}`,
          message: 'Card requires button text.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'carouselMessage':
      if (!d.cards || d.cards.length === 0) {
        issues.push({
          id: `val_carousel_empty_${node.id}`,
          nodeId: node.id,
          title: `Empty Carousel: ${label}`,
          message: 'Please add at least one card to the carousel.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'documentText':
      if (!d.fileName || !String(d.fileName).trim()) {
        issues.push({
          id: `val_doc_file_${node.id}`,
          nodeId: node.id,
          title: `Missing File Name: ${label}`,
          message: 'Please provide a file name.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    // Interactive Blocks
    case 'singleChoice':
    case 'multipleChoice':
      if (!d.question || !String(d.question).trim()) {
        issues.push({
          id: `val_choice_q_${node.id}`,
          nodeId: node.id,
          title: `Missing Question: ${label}`,
          message: 'Please enter a question prompt for this choice block.',
          severity: 'error',
          category: 'property',
        });
      }
      if (!d.options || d.options.length === 0) {
        issues.push({
          id: `val_choice_opt_${node.id}`,
          nodeId: node.id,
          title: `No Options: ${label}`,
          message: 'Please add at least one answer option.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'question':
      if (!d.question || !String(d.question).trim()) {
        issues.push({
          id: `val_q_prompt_${node.id}`,
          nodeId: node.id,
          title: `Missing Question Prompt: ${label}`,
          message: 'Please enter the question text.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'userInput':
      if (!d.fieldLabel || !String(d.fieldLabel).trim()) {
        issues.push({
          id: `val_inp_lbl_${node.id}`,
          nodeId: node.id,
          title: `Missing Field Label: ${label}`,
          message: 'Please enter a field label.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'form':
      if (!d.formTitle || !String(d.formTitle).trim()) {
        issues.push({
          id: `val_form_title_${node.id}`,
          nodeId: node.id,
          title: `Missing Form Title: ${label}`,
          message: 'Form requires a title header.',
          severity: 'warning',
          category: 'property',
        });
      }
      if (!d.fields || d.fields.length === 0) {
        issues.push({
          id: `val_form_fields_${node.id}`,
          nodeId: node.id,
          title: `Empty Form: ${label}`,
          message: 'Please add at least one field to this form.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'confirmation':
      if (!d.message || !String(d.message).trim()) {
        issues.push({
          id: `val_conf_msg_${node.id}`,
          nodeId: node.id,
          title: `Missing Message: ${label}`,
          message: 'Confirmation prompt message cannot be empty.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'navigation':
      if (!d.targetUrl || !String(d.targetUrl).trim()) {
        issues.push({
          id: `val_nav_url_${node.id}`,
          nodeId: node.id,
          title: `Missing Target URL: ${label}`,
          message: 'Please specify the destination web URL.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    case 'connectFlow':
      if (!d.flowName || !String(d.flowName).trim()) {
        issues.push({
          id: `val_flow_name_${node.id}`,
          nodeId: node.id,
          title: `Missing Target Flow: ${label}`,
          message: 'Please enter the name of the flow to connect to.',
          severity: 'error',
          category: 'property',
        });
      }
      break;

    default:
      break;
  }
}
