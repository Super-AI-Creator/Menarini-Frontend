import { EmailType } from '../../types/apps/email';
import mock from '../mock';
import { sub } from 'date-fns';
import user2 from '/src/assets/images/profile/user-2.jpg';
import user3 from '/src/assets/images/profile/user-3.jpg';
import user4 from '/src/assets/images/profile/user-4.jpg';
import user5 from '/src/assets/images/profile/user-5.jpg';
import user6 from '/src/assets/images/profile/user-6.jpg';
import user7 from '/src/assets/images/profile/user-7.jpg';
import user8 from '/src/assets/images/profile/user-8.jpg';
import user10 from '/src/assets/images/profile/user-10.jpg';
import user9 from '/src/assets/images/profile/user-9.jpg';

import adobe from '/src/assets/images/chat/icon-adobe.svg';
import chrome from '/src/assets/images/chat/icon-chrome.svg';
import figma from '/src/assets/images/chat/icon-figma.svg';
import java from '/src/assets/images/chat/icon-javascript.svg';
import zip from '/src/assets/images/chat/icon-zip-folder.svg';

const EmailData: EmailType[] = [
  {
    id: 1,
    from: 'Q3 Abstral AU docs',
    thumbnail: user10,
    subject: 'Hi Charles...',
    time: sub(new Date(), { days: 0, hours: 1, minutes: 45 }),
    To: 'knox.james@grandle.cp',
    emailExcerpt: 'Contrary to popular belief, Lorem Ipsum is not simply random text. ',
    emailContent: `<p>Hello Andrew, </p>
       <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum hendrerit lobortis. Nullam ut lacus eros. Sed at luctus urna, eu fermentum diam. In et tristique mauris.</p>
       <p>Ut id ornare metus, sed auctor enim. Pellentesque nisi magna, laoreet a augue eget, 
       tempor volutpat diam.</p>
       <p>Regards,<br/> <b>James Smith</b></p>
       `,
    unread: true,
    attachment: false,
    starred: false,
    important: false,
    inbox: true,
    sent: false,
    draft: false,
    spam: false,
    trash: false,
    label: 'Promotional',
    attchments: [
      {
        id: '#1Attach',
        image: adobe,
        title: 'DN_RO_abc.pdf',
        fileSize: '2MB',
      },
      {
        id: '#2Attach',
        image: adobe,
        title: 'PL_RO_abc.html',
        fileSize: '2MB',
      },
      {
        id: '#3Attach',
        image: adobe,
        title: 'INV_RO_abc.zip',
        fileSize: '2MB',
      },
    ],
  },
  {
    id: 2,
    from: 'DCS-24-lMP',
    thumbnail: user2,
    subject: 'To Menarini Group...',
    time: sub(new Date(), { days: 0, hours: 3, minutes: 45 }),
    To: 'abc@company.com',
    emailExcerpt: 'It has roots in a piece of classical Latin literature from 45 BC',
    emailContent: `<p>Hello Andrew, </p>
       <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum hendrerit lobortis. Nullam ut lacus eros. Sed at luctus urna, eu fermentum diam. In et tristique mauris.</p>
       <p>Ut id ornare metus, sed auctor enim. Pellentesque nisi magna, laoreet a augue eget, 
       tempor volutpat diam.</p>
       <p>Regards,<br/> <b>Michael Smith</b></p>
       `,
    unread: true,
    attachment: false,
    starred: false,
    important: false,
    inbox: true,
    sent: false,
    draft: false,
    spam: false,
    trash: false,
    label: 'Urgent',
    attchments: [],
  },
  {
    id: 3,
    from: 'KR_Phardiag',
    thumbnail: user2,
    subject: 'Hi Menarini Group...',
    time: sub(new Date(), { days: 0, hours: 3, minutes: 45 }),
    To: 'abc@company.com',
    emailExcerpt: 'It has roots in a piece of classical Latin literature from 45 BC',
    emailContent: `<p>Hello Andrew, </p>
       <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum hendrerit lobortis. Nullam ut lacus eros. Sed at luctus urna, eu fermentum diam. In et tristique mauris.</p>
       <p>Ut id ornare metus, sed auctor enim. Pellentesque nisi magna, laoreet a augue eget, 
       tempor volutpat diam.</p>
       <p>Regards,<br/> <b>Michael Smith</b></p>
       `,
    unread: true,
    attachment: false,
    starred: false,
    important: false,
    inbox: true,
    sent: false,
    draft: false,
    spam: false,
    trash: false,
    label: 'Urgent',
    attchments: [],
  },
];

mock.onGet('/api/data/email/EmailData').reply(() => {
  return [200, JSON.parse(JSON.stringify(EmailData))];
});

mock.onDelete('/api/data/email/delete').reply((config) => {
  const { emailId } = JSON.parse(config.data); // Extract email ID from the request data
  alert(config.data)
  const index = EmailData.findIndex((email) => email.id === emailId); // Find the index of the email with the specified ID
  if (index !== -1) {
    EmailData.splice(index, 1); // Remove the email from the data array
    return [200, { success: true }]; // Return success response
  } else {
    return [404, { error: 'Email not found' }]; // Return error response if email not found
  }
});
mock.onPost('/api/data/email/startOCR').reply((config) => {
  const { data } = JSON.parse(config.data); 
  const emailId = data;
  if (emailId == 1) {
    return [
      200,
      {
        success: true,
        data: {
          dataAreaID: 'VN93',
          PONumber: 'P01-006792',
          POLineNumber: 'M01006792',
          ItemCode: '6004-11231-20',
          ItemName: 'SYMPAL 25SXG20',
          Quantity: 13500,
          UnitPrice: 1000.0,
          PackingSlipNo: '2510898670',
          InvoiceNo: '1240406',
          PostingDate: '04/11/2024',
          ShippedQuantity: '13080',
          BatchNumber: 'E0133E6',
          ManufacturingDate: '22/12/2023',
          ExpiryDate: '30/11/2025',
          VendorCode: 'VTPHARD0001',
          VendorName: 'KKI',
          NoOfItemCodeInPO: '1',
          Incoterms: 'CIP',
          DocumentDate: '06/09/2024',
          emailId: 1,
        },
      },
    ];
  } else {
    return [
      200,
      {
        success: false,
        data: {
          dataAreaID: 'VN93',
          PONumber: 'P01-006792',
          POLineNumber: 'M01006792',
          ItemCode: '6004-11231-20',
          ItemName: '',
          Quantity: null,
          UnitPrice: 1000.0,
          PackingSlipNo: '',
          InvoiceNo: '',
          PostingDate: '04/11/2024',
          ShippedQuantity: '13080',
          BatchNumber: 'E0133E6',
          ManufacturingDate: '22/12/2023',
          ExpiryDate: '30/11/2025',
          VendorCode: '',
          VendorName: 'KKI',
          NoOfItemCodeInPO: '1',
          Incoterms: 'CIP',
          DocumentDate: '06/09/2024',
          emailId: 2,
        },
      },
    ];
  }
});
export default EmailData;
