export type Field = { key: string; label: string; type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'email' | 'select'; required?: boolean; options?: string[]; reference?: string };
export type Resource = { title: string; description: string; fields: Field[]; mode: 'read' | 'crud' | 'update' };
export const resources: Record<string, Resource> = {
 profiles: { title: 'Users', description: 'Registered profiles and administrator status.', mode: 'read', fields: [] },
 prompt_chains: { title: 'Prompt chains', description: 'Reusable workflows. Open the chain studio to edit their steps.', mode: 'read', fields: [] },
 prompt_chain_steps: { title: 'Prompt chain steps', description: 'Prompts, models, and execution order across workflows.', mode: 'read', fields: [] },
 prompt_chain_mix: { title: 'Prompt chain mix', description: 'Control each chain’s relative weight and availability.', mode: 'update', fields: [{key:'weight',label:'Weight',type:'number',required:true},{key:'enabled',label:'Enabled',type:'checkbox'}] },
 terms: {title:'Terms',description:'A shared vocabulary for your humor generation system.',mode:'crud',fields:[{key:'term',label:'Term',required:true},{key:'definition',label:'Definition',type:'textarea',required:true}]},
 generated_media: {title:'AI generated media',description:'Generated captions and their images, including chain outputs.',mode:'read',fields:[]},
 generation_requests: {title:'Generation requests',description:'Inspect execution status, input, timing, and failures.',mode:'read',fields:[]},
 ai_generation_examples: {title:'AI generation examples',description:'Maintain examples of the inputs and outputs you want.',mode:'crud',fields:[{key:'input',label:'Input',type:'textarea',required:true},{key:'output',label:'Output',type:'textarea',required:true},{key:'explanation',label:'Explanation',type:'textarea'}]},
 llm_models: {title:'LLM models',description:'Model identifiers and their provider. Disabled models cannot run.',mode:'crud',fields:[{key:'name',label:'Display name',required:true},{key:'model_id',label:'API model ID',required:true},{key:'provider_id',label:'Provider',reference:'llm_providers',required:true},{key:'enabled',label:'Enabled',type:'checkbox'}]},
 llm_providers: {title:'LLM providers',description:'Supported API adapters. Credentials are configured in server environment variables.',mode:'crud',fields:[{key:'name',label:'Name',required:true},{key:'api_kind',label:'API adapter',type:'select',options:['gemini','openai'],required:true}]},
 llm_responses: {title:'LLM responses',description:'Every recorded response with its prompt, model, and request.',mode:'read',fields:[]},
 allowed_signup_domains: {title:'Allowed signup domains',description:'When either access list has entries, new signups must match a domain or whitelisted email.',mode:'crud',fields:[{key:'domain',label:'Domain (e.g. columbia.edu)',required:true}]},
 whitelisted_emails: {title:'Whitelisted email addresses',description:'Exact email addresses allowed to sign up, in addition to allowed domains.',mode:'crud',fields:[{key:'email',label:'Email',type:'email',required:true}]},
 images: {title:'Images',description:'Upload images, update their descriptions, and manage the image library.',mode:'crud',fields:[{key:'alt',label:'Image description',required:true}]},
};
