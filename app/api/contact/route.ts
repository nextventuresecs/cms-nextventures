
import { supabase } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_12345678901234567890123456789012');

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  organization: z.string().optional(),
  service: z.string().min(1, 'Service interest is required'),
  message: z.string().optional(),
  subscribed: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // Insert contact into database
    const { data: contact, error: dbError } = await supabase
      .from('contacts')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        organization: validatedData.organization,
        service_interest: validatedData.service,
        message: validatedData.message,
        status: 'new',
        source: 'website_contact_form',
        subscribed: true,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save contact');
    }

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: 'Next Ventures <noreply@nextventures.in>',
        to: validatedData.email,
        subject: 'Thank you for contacting Next Ventures',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Thank You for Reaching Out!</h2>
            <p>Dear ${validatedData.name},</p>
            <p>We've received your inquiry regarding <strong>${validatedData.service}</strong>.</p>
            <p>Our team will review your message and get back to you within 24 hours.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Your Details:</strong></p>
              <p style="margin: 5px 0;">Name: ${validatedData.name}</p>
              <p style="margin: 5px 0;">Email: ${validatedData.email}</p>
              <p style="margin: 5px 0;">Phone: ${validatedData.phone}</p>
              ${validatedData.organization ? `<p style="margin: 5px 0;">Organization: ${validatedData.organization}</p>` : ''}
            </div>
            <p>Best regards,<br>Next Ventures Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await resend.emails.send({
        from: 'Next Ventures CMS <noreply@nextventures.in>',
        to: 'info@nextventures.in',
        subject: `New Contact Form Submission - ${validatedData.service}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Contact Form Submission</h2>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${validatedData.name}</p>
              <p><strong>Email:</strong> ${validatedData.email}</p>
              <p><strong>Phone:</strong> ${validatedData.phone}</p>
              ${validatedData.organization ? `<p><strong>Organization:</strong> ${validatedData.organization}</p>` : ''}
              <p><strong>Service Interest:</strong> ${validatedData.service}</p>
              ${validatedData.message ? `<p><strong>Message:</strong><br>${validatedData.message}</p>` : ''}
            </div>
            <p><a href="${process.env.APP_URL || 'https://blog.nextventures.in'}/admin/contacts/${contact.id}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View in CMS</a></p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      data: { id: contact.id },
      message: 'Contact form submitted successfully',
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.issues[0].message },
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Contact API error:', message);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}